import { ApiError, GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { Message } from "@/models/types";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseIdToken";
import { rateLimitHit } from "@/lib/server/rateLimitMemory";

/**
 * Consigne système : **arabe tunisien (تونسي / derja)** par défaut + agriculture (Gabès / oasis).
 * Si l’utilisateur écrit clairement en français uniquement, tu peux répondre en français.
 */
const SYSTEM_INSTRUCTION = `Tu es "اسألني" (Ask me), l’assistant agricole officiel de la plateforme « Gabes bin ydik » (ڤَابس بين يديك) — Gabès, Tunisie.

LANGUE (très important) :
- Réponds **surtout en arabe tunisien (تونسي / derja)** : langue parlée locale, naturelle, chaude, pas en arabe littéraire soutenu (فصحى) sauf pour un terme technique ponctuel si utile.
- Utilise des tournures tunisiennes courantes quand c’est naturel (مثلاً: كيفاش، علاش، باش، نجم، ما، شنوة، وين، عندك، حاجة، برشا، شوية، اليوم، الدنيا، الخ…).
- Si le message de l’utilisateur est **entièrement en français** sans mélange arabe, tu peux répondre en **français** pour être clair.
- Si l’utilisateur mélange français et tunisien, privilégie le **tunisien**.

Rôle : conseiller agriculteurs, citoyens et acteurs locaux sur l’**agriculture** en zone **oasienne et semi-aride**, en priorité **Gabès / الجنوب التونسي**.

Expertise (prioritaire) :
- Grenade (رمان قابسي Gabsi)، نخيل، زيتون، خضار الواحة، أشجار مثمرة.
- الماء والريّ : توفير الماء، التنقيط، الملوحة، الإجهاد المائي، الشبكات.
- التربة والتسميد : أعراض الأوراق، العناصر، السماد العضوي والمعدني، الدورات.
- المناخ المحلي : حر، جفاف، رياح، تقويم زراعي، تظليل، تغطية التربة.
- الآفات والأمراض : علامات، وقاية، توجيه نحو مهندس فلاحي إذا الحالة خطيرة أو غير مؤكدة.
- فلاحة أكثر احتراماً للماء والبيئة في الواحات.

Hors sujet (غير فلاحة) : réponse courte et utile, puis lien avec البيئة أو الفلاحة إن أمكن.

Style :
- Concret, étapes simples، بدون تعقيد؛ إذا ينقصك معلومة (الصنف، مرحلة النمو)، اسأل 1–3 أسئلة قصيرة.

Limites :
- Pas de chiffres météo ou prix du marché présentés comme certains sans les qualifier d’estimation.
- Situations sanitaires graves ou douteuses : orienter vers un ingénieur agronome ou les services compétents.`;

const MAX_MESSAGES = 32;
const MAX_TEXT_PER_MESSAGE = 8000;

const MODEL_FALLBACKS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"] as const;

const isAuthEmulator = () => process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true";

function normalizeMessages(messages: Message[]): Message[] {
  const trimmed = messages
    .filter((m) => typeof m.text === "string" && m.text.trim().length > 0)
    .map((m) => ({
      ...m,
      text: m.text.trim().slice(0, MAX_TEXT_PER_MESSAGE),
    }));
  while (trimmed.length > 0 && trimmed[0].role !== "user") {
    trimmed.shift();
  }
  if (trimmed.length === 0) return [];
  const capped = trimmed.length > MAX_MESSAGES ? trimmed.slice(-MAX_MESSAGES) : trimmed;
  return mergeConsecutiveRoles(capped);
}

function mergeConsecutiveRoles(messages: Message[]): Message[] {
  const out: Message[] = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) {
      last.text = `${last.text}\n\n${m.text}`;
    } else {
      out.push({ role: m.role, text: m.text });
    }
  }
  return out;
}

function extractTextFromResponse(response: { text?: string; candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] }): string {
  const direct = response.text?.trim();
  if (direct) return direct;
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  let acc = "";
  for (const p of parts) {
    if (typeof p.text === "string" && p.text.length > 0 && p.thought !== true) acc += p.text;
  }
  return acc.trim();
}

async function assertAuthorizedChat(request: Request): Promise<NextResponse | null> {
  if (isAuthEmulator()) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimitHit(`chat:emu:${ip}`, 45, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "rate_limited", detail: String(rl.retryAfterSec ?? 60) }, { status: 429 });
    }
    return null;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json(
      {
        error: "unauthorized",
        detail: "Authorization: Bearer <Firebase ID token> requis (getIdToken() côté client).",
      },
      { status: 401 },
    );
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "server_misconfig", detail: "NEXT_PUBLIC_FIREBASE_PROJECT_ID manquant." }, { status: 500 });
  }

  try {
    const { uid } = await verifyFirebaseIdToken(token, projectId);
    const rl = rateLimitHit(`chat:uid:${uid}`, 36, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "rate_limited", detail: String(rl.retryAfterSec ?? 60) }, { status: 429 });
    }
  } catch {
    return NextResponse.json({ error: "unauthorized", detail: "Jeton Firebase invalide ou expiré." }, { status: 401 });
  }

  return null;
}

export async function POST(request: Request) {
  const authErr = await assertAuthorizedChat(request);
  if (authErr) return authErr;

  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "missing_api_key" }, { status: 500 });
    }

    const body = (await request.json()) as { messages?: Message[] };
    const raw = body.messages ?? [];
    if (!Array.isArray(raw) || raw.length === 0) {
      return NextResponse.json({ error: "invalid_messages" }, { status: 400 });
    }

    const messages = normalizeMessages(raw);
    if (messages.length === 0) {
      return NextResponse.json({ error: "invalid_messages" }, { status: 400 });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const preferred = process.env.GEMINI_API_MODEL?.trim();
    const modelOrder = preferred
      ? [preferred, ...MODEL_FALLBACKS.filter((m) => m !== preferred)]
      : [...MODEL_FALLBACKS];

    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    let lastErr = "unknown";
    for (const model of modelOrder) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.55,
            maxOutputTokens: 2048,
          },
        });
        const text = extractTextFromResponse(response);
        if (text) {
          return NextResponse.json({ text });
        }
        lastErr = `empty_response (${model})`;
      } catch (err) {
        lastErr = err instanceof Error ? err.message : String(err);
        if (err instanceof ApiError && err.status === 404) {
          continue;
        }
        break;
      }
    }

    return NextResponse.json({ error: "llm_failed", detail: lastErr.slice(0, 500) }, { status: 502 });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    const hint =
      e instanceof ApiError && (e.status === 401 || e.status === 403)
        ? "invalid_api_key"
        : e instanceof ApiError && e.status === 429
          ? "rate_limited"
          : undefined;
    return NextResponse.json(
      { error: "llm_failed", detail: msg.slice(0, 400), hint },
      { status: 502 },
    );
  }
}

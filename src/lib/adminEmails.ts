/**
 * E-mails autorisés en interface administrateur.
 * `NEXT_PUBLIC_ADMIN_EMAILS` (virgules) **s’ajoute** à la liste par défaut — il ne la remplace plus,
 * pour éviter qu’un .env incomplet retire ton compte admin.
 */
const FROM_ENV = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/** Compte admin par défaut (toujours inclus). */
const FALLBACK = ["ezzeddinezouiten.pro@gmail.com"];

/** Gmail / Googlemail : la partie locale ignore les points (même compte). */
function normalizeForCompare(email: string): string {
  const e = email.trim().toLowerCase();
  const m = /^([^@]+)@(gmail\.com|googlemail\.com)$/.exec(e);
  if (!m) return e;
  const localNoDots = m[1].replace(/\./g, "");
  return `${localNoDots}@${m[2]}`;
}

function adminEmailList(): string[] {
  const merged = [...FALLBACK.map((x) => x.trim().toLowerCase()), ...FROM_ENV];
  return [...new Set(merged)];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const n = normalizeForCompare(email);
  return adminEmailList().some((a) => normalizeForCompare(a) === n);
}

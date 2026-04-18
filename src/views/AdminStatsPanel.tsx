"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PieChart, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { fetchAdminDashboardStats, type AdminDashboardStats } from "@/lib/firebase/adminStats";

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 200;
  const h = 48;
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
        <span>{label}</span>
        <span className="text-violet-800 tabular-nums">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AdminStatsPanel({ t }: { t: (fr: string, ar: string) => string }) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchAdminDashboardStats();
      setStats(s);
    } catch {
      setError(t("Impossible de charger les statistiques.", "تعذر تحميل الإحصائيات."));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = stats
    ? [
        { fr: "Utilisateurs (profils)", ar: "المستخدمون", v: stats.users, isMoney: false as const },
        { fr: "Articles news", ar: "مقالات الأخبار", v: stats.news, isMoney: false as const },
        { fr: "Réclamations", ar: "الشكاوى", v: stats.reclamations, isMoney: false as const },
        { fr: "Posts forum", ar: "منشورات المنتدى", v: stats.forumPosts, isMoney: false as const },
        { fr: "Produits marketplace", ar: "منتجات السوق", v: stats.marketplaceProducts, isMoney: false as const },
        {
          fr: "Montants collectés (dons, TND)",
          ar: "المبالغ المجمّعة (تبرعات، د.ت)",
          v: stats.donationTotalTnd,
          isMoney: true as const,
        },
      ]
    : [];

  const maxBar = useMemo(() => {
    if (!stats) return 1;
    return Math.max(1, stats.users, stats.news, stats.reclamations, stats.forumPosts, stats.marketplaceProducts, Math.ceil(stats.donationTotalTnd / 1000));
  }, [stats]);

  const sparkValues = useMemo(() => {
    if (!stats) return [0, 0, 0, 0, 0];
    return [
      stats.users,
      stats.news,
      stats.reclamations,
      stats.forumPosts,
      stats.marketplaceProducts,
      Math.min(stats.donationTotalTnd, maxBar * 1000),
    ];
  }, [stats, maxBar]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[2rem] bg-white/70 border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-violet-500/15 text-violet-800">
            <PieChart size={26} />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{t("Statistiques", "إحصائيات")}</h2>
            <p className="text-xs text-zinc-500 font-bold mt-1">{t("Données réelles Firestore (agrégations).", "بيانات فعلية من فايربيس.")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-200 text-violet-800 text-[10px] font-black uppercase hover:bg-violet-50 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          {t("Actualiser", "تحديث")}
        </button>
      </div>

      {error ? <p className="text-sm font-bold text-red-600 px-2">{error}</p> : null}

      {loading && !stats ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-600" size={36} />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-violet-50/90 to-emerald-50/80 border border-violet-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-violet-800 tracking-widest mb-3">{t("Vue d’ensemble (tendance)", "نظرة عامة")}</p>
            <div className="text-violet-600 w-full h-14">
              <Sparkline values={sparkValues} className="w-full h-full" />
            </div>
            <p className="text-[10px] text-zinc-500 font-bold mt-2">
              {t("Courbe indicative basée sur les volumes par catégorie.", "منحنى توضيحي حسب الأحجام.")}
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-white/70 border border-white shadow-sm space-y-4">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t("Répartition (barres)", "الأعمدة")}</p>
            <div className="space-y-4">
              {cards
                .filter((c) => !c.isMoney)
                .map((c) => (
                  <BarRow key={c.fr} label={t(c.fr, c.ar)} value={c.v} max={maxBar} />
                ))}
              <BarRow
                label={t("Dons (échelle relative)", "التبرعات (نسبي)")}
                value={Math.min(maxBar, Math.ceil(stats.donationTotalTnd / 100) || 0)}
                max={maxBar}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c) => (
              <div key={c.fr} className="p-5 rounded-2xl bg-white/70 border border-white shadow-sm">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t(c.fr, c.ar)}</p>
                <p className="text-2xl font-black text-violet-800 mt-2 break-words tabular-nums">
                  {c.isMoney ? `${c.v.toLocaleString("fr-TN", { maximumFractionDigits: 0 })} TND` : String(c.v)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

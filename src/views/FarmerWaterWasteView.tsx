"use client";

import { Droplets } from "lucide-react";
import { motion } from "motion/react";

export function FarmerWaterWasteView({ t }: { t: (fr: string, ar: string) => string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white/70 border border-white shadow-sm">
        <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-800">
          <Droplets size={26} />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{t("Modèle gaspillage d’eau", "نموذج هدر المياه")}</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">{t("Estimation des pertes d’irrigation (démo).", "تقدير خسائر الري (عرض).")}</p>
        </div>
      </div>
      <div className="p-6 rounded-[2rem] bg-white/60 border border-white">
        <p className="text-sm font-bold text-zinc-700 leading-relaxed">
          {t(
            "Indicateur synthétique : faible gaspillage cette semaine. Branchez vos capteurs de débit pour affiner le modèle.",
            "مؤشر تجريبي: هدر منخفض هذا الأسبوع. اربط مجسات التدفق لتحسين النموذج.",
          )}
        </p>
        <div className="mt-6 h-3 rounded-full bg-zinc-200 overflow-hidden">
          <div className="h-full w-[18%] rounded-full bg-sky-500" />
        </div>
        <p className="text-[10px] font-black uppercase text-zinc-400 mt-2 tracking-widest">{t("Perte estimée ~ 18%", "خسارة تقديرية ~ 18٪")}</p>
      </div>
    </motion.div>
  );
}

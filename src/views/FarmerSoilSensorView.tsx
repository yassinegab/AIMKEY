"use client";

import { Layers3 } from "lucide-react";
import { motion } from "motion/react";

export function FarmerSoilSensorView({ t }: { t: (fr: string, ar: string) => string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white/70 border border-white shadow-sm">
        <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-800">
          <Layers3 size={26} />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{t("Capteur sol", "مستشعر التربة")}</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">{t("Humidité, pH, température (démo).", "الرطوبة، الحموضة، الحرارة (عرض).")}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { fr: "Humidité", ar: "الرطوبة", v: "42%", ok: true },
          { fr: "pH", ar: "الحموضة", v: "7.1", ok: true },
          { fr: "Température", ar: "الحرارة", v: "24°C", ok: true },
        ].map((row) => (
          <div key={row.fr} className="p-5 rounded-2xl bg-white/70 border border-white text-center shadow-sm">
            <p className="text-[10px] font-black uppercase text-zinc-400">{t(row.fr, row.ar)}</p>
            <p className="text-2xl font-black text-emerald-700 mt-2">{row.v}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

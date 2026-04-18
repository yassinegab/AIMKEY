"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { incrementDonationCurrent, subscribeDonationProjects } from "@/lib/firebase/appContentRepos";
import type { DonationProject } from "@/models/types";

export function DonationView({ t }: { t: (fr: string, ar: string) => string; isRTL: boolean }) {
  const [projects, setProjects] = useState<DonationProject[]>([]);
  const [step, setStep] = useState<"list" | "donation" | "payment" | "success">("list");
  const [selectedProject, setSelectedProject] = useState<DonationProject | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [cardInfo, setCardInfo] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeDonationProjects(setProjects);
  }, []);

  const handleDonate = (p: DonationProject) => {
    setSelectedProject(p);
    setStep("donation");
  };

  const processPayment = async () => {
    if (!selectedProject) return;
    const amt = Math.max(0, Math.round(parseFloat(amount) || 0));
    setLoading(true);
    try {
      if (amt > 0) {
        await incrementDonationCurrent(selectedProject.id, amt);
      }
    } catch {
      /* démo : on affiche quand même le succès local */
    }
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1200);
  };

  if (step === "success" && selectedProject) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/60 backdrop-blur-3xl p-16 rounded-[4rem] border border-white text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter mb-4">{t("Paiement Confirmé !", "تم تأكيد الدفع !")}</h2>
        <p className="text-zinc-500 font-bold max-w-sm mx-auto mb-12">
          {t(
            "Merci pour votre générosité. Le montant a été ajouté au projet (démo — pas de vrai prélèvement).",
            "شكراً. تمت إضافة المبلغ للمشروع (عرض تجريبي).",
          )}
        </p>
        <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 text-left mb-12">
          <div className="flex justify-between mb-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Projet</span>
            <span className="text-xs font-bold text-zinc-900">{t(selectedProject.title.fr, selectedProject.title.ar)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-zinc-200">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Montant</span>
            <span className="text-2xl font-black text-emerald-600">{amount} DT</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep("list");
            setSelectedProject(null);
            setAmount("");
          }}
          className="px-10 py-5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors"
        >
          {t("Retour aux projets", "العودة للمشاريع")}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {step === "list" && (
        <>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none">{t("Solidarité Gabès", "تضامن قابس")}</h2>
            <p className="text-zinc-500 font-bold leading-relaxed">
              {t(
                "Choisissez un projet proposé par l’administration et participez au montant collecté.",
                "اختر مشروعاً من الإدارة وساهم في المبلغ.",
              )}
            </p>
          </div>
          {projects.length === 0 ? (
            <p className="text-center text-sm font-bold text-zinc-500 py-16">{t("Aucun projet de don pour le moment.", "لا مشاريع تبرع حالياً.")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white overflow-hidden shadow-2xl flex flex-col group transition-all hover:bg-white"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute top-6 left-6 flex gap-2 flex-wrap">
                      {p.tags.map((tag) => (
                        <span key={tag} className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase border border-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter mb-4 leading-none">{t(p.title.fr, p.title.ar)}</h3>
                    <p className="text-zinc-500 font-medium mb-8 leading-relaxed line-clamp-3">{t(p.description.fr, p.description.ar)}</p>

                    <div className="mt-auto space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-400">{t("Collecté", "تم جمعه")}</span>
                          <span className="text-emerald-600 font-black">{Math.round((p.current / p.target) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (p.current / p.target) * 100)}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest pt-1">
                          <span>{p.current} DT</span>
                          <span>
                            {t("Objectif", "الهدف")}: {p.target} DT
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDonate(p)}
                        className="w-full py-5 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-xl shadow-zinc-900/10"
                      >
                        {t("Participer", "المشاركة")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === "donation" && selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white shadow-2xl"
        >
          <button
            type="button"
            onClick={() => setStep("list")}
            className="mb-8 text-[10px] font-black text-zinc-400 flex items-center gap-2 uppercase tracking-widest hover:text-zinc-900 transition-colors"
          >
            <X size={14} /> {t("Annuler", "إلغاء")}
          </button>
          <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter mb-8 leading-none">{t("Choisissez un montant", "اختر المبلغ")}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {["10", "20", "50", "100"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={cn(
                  "py-6 rounded-3xl text-xl font-black transition-all border-2",
                  amount === val ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-zinc-100 text-zinc-400 hover:border-emerald-200",
                )}
              >
                {val} <span className="text-[10px] uppercase">DT</span>
              </button>
            ))}
          </div>
          <div className="relative mb-12">
            <input
              type="number"
              placeholder={t("Montant libre...", "مبلغ حر...")}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-8 bg-zinc-50 rounded-[2.5rem] border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-black text-3xl placeholder:text-zinc-200 transition-all"
            />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-300 font-black">DT</span>
          </div>
          <button
            type="button"
            disabled={!amount || parseFloat(amount) <= 0}
            onClick={() => setStep("payment")}
            className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("Procéder au paiement", "المتابعة للدفع")}
          </button>
        </motion.div>
      )}

      {step === "payment" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-zinc-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <button
            type="button"
            onClick={() => setStep("donation")}
            className="mb-10 text-[10px] font-black text-white/40 flex items-center gap-2 uppercase tracking-widest hover:text-white transition-colors"
          >
            <X size={14} /> {t("Retour", "رجوع")}
          </button>

          <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{t("Paiement (démo)", "دفع (تجريبي)")}</h3>
            <span className="text-xl font-black text-emerald-400">{amount} DT</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t("Numéro de Carte", "رقم البطاقة")}</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-emerald-500 transition-all font-mono"
                onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t("Expiration", "تاريخ الانتهاء")}</label>
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-emerald-500 transition-all font-mono"
                  onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">CVC</label>
                <input
                  type="password"
                  placeholder="***"
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-emerald-500 transition-all font-mono"
                  onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t("Nom sur la Carte", "الاسم على البطاقة")}</label>
              <input
                type="text"
                placeholder="MOHAMED BEN SALEM"
                className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-emerald-500 transition-all font-mono"
                onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              type="button"
              onClick={processPayment}
              disabled={loading}
              className="bg-emerald-500 font-black text-[10px] uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-emerald-600 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={18} />}
              {t("Valider le don", "تأكيد التبرع")}
            </button>
          </div>
          <p className="mt-8 text-[8px] font-bold text-white/20 uppercase text-center tracking-widest">{t("Simulation locale", "محاكاة محلية")}</p>
        </motion.div>
      )}
    </div>
  );
}

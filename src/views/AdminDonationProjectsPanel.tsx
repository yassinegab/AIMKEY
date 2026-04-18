"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import {
  createDonationProject,
  deleteDonationProject,
  subscribeDonationProjects,
  updateDonationProject,
} from "@/lib/firebase/appContentRepos";
import type { DonationProject } from "@/models/types";

export function AdminDonationProjectsPanel({ t, authorUid }: { t: (fr: string, ar: string) => string; authorUid: string }) {
  const [list, setList] = useState<DonationProject[]>([]);
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [target, setTarget] = useState("10000");
  const [image, setImage] = useState("https://picsum.photos/seed/dima-don/800/600");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<DonationProject | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeDonationProjects(setList);
  }, []);

  function resetForm() {
    setTitleFr("");
    setTitleAr("");
    setDescFr("");
    setDescAr("");
    setTarget("10000");
    setImage("https://picsum.photos/seed/dima-don/800/600");
    setEditing(null);
  }

  function openEdit(p: DonationProject) {
    setEditing(p);
    setTitleFr(p.title.fr);
    setTitleAr(p.title.ar);
    setDescFr(p.description.fr);
    setDescAr(p.description.ar);
    setTarget(String(p.target));
    setImage(p.image);
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createDonationProject({
        authorUid,
        title: { fr: titleFr.trim(), ar: titleAr.trim() || titleFr.trim() },
        description: { fr: descFr.trim(), ar: descAr.trim() || descFr.trim() },
        image: image.trim() || "https://picsum.photos/seed/don/800/600",
        target: Math.max(1, parseInt(target, 10) || 1),
        current: 0,
        tags: ["#Gabès"],
      });
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusyId(editing.id);
    try {
      await updateDonationProject(editing.id, {
        title: { fr: titleFr.trim(), ar: titleAr.trim() || titleFr.trim() },
        description: { fr: descFr.trim(), ar: descAr.trim() || descFr.trim() },
        image: image.trim() || "https://picsum.photos/seed/don/800/600",
        target: Math.max(1, parseInt(target, 10) || 1),
        tags: editing.tags?.length ? editing.tags : ["#Gabès"],
      });
      resetForm();
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(t("Supprimer ce projet ?", "حذف هذا المشروع؟"))) return;
    setBusyId(id);
    try {
      await deleteDonationProject(id);
      if (editing?.id === id) resetForm();
    } finally {
      setBusyId(null);
    }
  }

  const formTitle = editing ? t("Modifier le projet", "تعديل المشروع") : t("Nouveau projet", "مشروع جديد");
  const formSubmit = editing ? saveEdit : addProject;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white/70 border border-white shadow-sm">
        <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-700">
          <Heart size={26} />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{t("Projets de don", "مشاريع التبرع")}</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">{t("Créés ici, visibles côté citoyen.", "تظهر للمواطن.")}</p>
        </div>
      </div>

      <form onSubmit={(e) => void formSubmit(e)} className="p-6 rounded-[2rem] bg-white/70 border border-white space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black uppercase text-emerald-700 flex items-center gap-2">
            {editing ? <Pencil size={16} /> : <Plus size={16} />}
            {formTitle}
          </p>
          {editing ? (
            <button type="button" onClick={resetForm} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500" aria-label={t("Fermer", "إغلاق")}>
              <X size={18} />
            </button>
          ) : null}
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Titre (FR)", "عنوان (فرنسي)")}</label>
          <input required value={titleFr} onChange={(e) => setTitleFr(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Titre (AR)", "عنوان (عربي)")}</label>
          <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-right" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Description (FR)", "وصف (فرنسي)")}</label>
          <textarea required value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Description (AR)", "وصف (عربي)")}</label>
          <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} dir="rtl" className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold resize-none text-right" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Image (URL)", "صورة (رابط)")}</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">{t("Objectif (TND)", "الهدف (د.ت)")}</label>
          <input type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold" />
        </div>
        <button
          type="submit"
          disabled={saving || busyId === editing?.id}
          className="w-full py-4 rounded-xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 flex justify-center gap-2"
        >
          {saving || busyId === editing?.id ? <Loader2 className="animate-spin" size={18} /> : null}
          {editing ? t("Enregistrer les modifications", "حفظ التعديلات") : t("Publier le projet", "نشر المشروع")}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-1">{t("Projets publiés", "المشاريع المنشورة")}</h3>
        {list.map((p) => (
          <div key={p.id} className="p-5 rounded-[2rem] bg-white/70 border border-white shadow-sm flex gap-4">
            <img src={p.image} alt="" className="w-24 h-24 rounded-2xl object-cover border border-zinc-100 shrink-0 hidden sm:block" />
            <div className="min-w-0 flex-1">
              <p className="font-black text-zinc-900 text-sm">{t(p.title.fr, p.title.ar)}</p>
              <p className="text-[10px] text-zinc-500 font-bold mt-1">
                {p.current.toLocaleString("fr-TN")} / {p.target.toLocaleString("fr-TN")} TND
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="p-2 rounded-xl border border-violet-200 text-violet-800 hover:bg-violet-50"
                title={t("Modifier", "تعديل")}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => void onDelete(p.id)}
                className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                title={t("Supprimer", "حذف")}
              >
                {busyId === p.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

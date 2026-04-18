/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  TreeDeciduous,
  Heart,
  MessagesSquare,
  Newspaper,
  Wind,
  ClipboardList,
  Store,
  LogOut,
  Layers3,
  Droplets,
  Inbox,
  CalendarDays,
  PieChart,
  User,
  Megaphone,
  Gift,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeAdminNotifications } from "@/lib/firebase/appContentRepos";
import type { AdminNotification, Lang, UserRole } from "@/models/types";
import { AdminDonationProjectsPanel } from "./AdminDonationProjectsPanel";
import { AdminEventsPanel } from "./AdminEventsPanel";
import { AdminAlertsPanel } from "./AdminAlertsPanel";
import { AdminNewsPanel } from "./AdminNewsPanel";
import { AdminStatsPanel } from "./AdminStatsPanel";
import { Chatbot } from "./Chatbot";
import { DonationView } from "./DonationView";
import { EnvironmentalMap } from "./EnvironmentalMap";
import { FarmerMarketplace } from "./FarmerMarketplace";
import { FarmerSoilSensorView } from "./FarmerSoilSensorView";
import { FarmerWaterWasteView } from "./FarmerWaterWasteView";
import { ForumFirestorePanel } from "./ForumFirestorePanel";
import { ProfileView } from "./ProfileView";
import { SpaceNewsView } from "./SpaceNewsView";
import { SpaceReclamationView } from "./SpaceReclamationView";

type NavItem = { id: string; label: string; icon: typeof MessagesSquare };

export type DimaAppViewProps = {
  role: UserRole;
  userUid: string;
  userEmail: string | null;
  lang: Lang;
  setLang: (l: Lang) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  events: import("@/models/types").CityEvent[];
  isRTL: boolean;
  t: (fr: string, ar: string) => string;
  logout: () => void | Promise<void>;
};

function navForRole(role: UserRole, t: (fr: string, ar: string) => string): NavItem[] {
  if (role === "CITIZEN") {
    return [
      { id: "forum", label: t("Forum", "المنتدى"), icon: MessagesSquare },
      { id: "reclamation", label: t("Réclamation", "شكوى"), icon: ClipboardList },
      { id: "chat", label: t("Expert IA — اسألني", "خبير ذكي — اسألني"), icon: MessageCircle },
      { id: "news", label: t("News", "الأخبار"), icon: Newspaper },
      { id: "pollution", label: t("Alerte & heatmap pollution air", "تنبيه وخريطة تلوث الهواء"), icon: Wind },
      { id: "donations", label: t("Donation", "تبرعات"), icon: Heart },
      { id: "profile", label: t("Mon profil", "ملفي"), icon: User },
    ];
  }
  if (role === "FARMER") {
    return [
      { id: "capteur", label: t("Capteur sol", "مستشعر التربة"), icon: Layers3 },
      { id: "eau", label: t("Modèle gaspillage d’eau", "نموذج هدر المياه"), icon: Droplets },
      { id: "market", label: t("Marketplace", "السوق"), icon: Store },
      { id: "reclamation", label: t("Réclamation", "شكوى"), icon: ClipboardList },
      { id: "forum", label: t("Forum", "المنتدى"), icon: MessagesSquare },
      { id: "news", label: t("News", "الأخبار"), icon: Newspaper },
      { id: "profile", label: t("Mon profil", "ملفي"), icon: User },
    ];
  }
  return [
    { id: "reclamations", label: t("Réclamation", "شكوى"), icon: Inbox },
    { id: "forum", label: t("Forum (modération)", "المنتدى"), icon: MessagesSquare },
    { id: "admin-alerts", label: t("Signalements", "تبليغات"), icon: Bell },
    { id: "events", label: t("Événement", "فعاليات"), icon: CalendarDays },
    { id: "stats", label: t("Statistique", "إحصائيات"), icon: PieChart },
    { id: "admin-news", label: t("Gérer news", "إدارة الأخبار"), icon: Megaphone },
    { id: "admin-donations", label: t("Projets dons", "مشاريع التبرع"), icon: Gift },
    { id: "profile", label: t("Mon profil", "ملفي"), icon: User },
  ];
}

export function DimaAppView({
  role,
  userUid,
  userEmail,
  lang,
  setLang,
  activeTab,
  setActiveTab,
  events,
  isRTL,
  t,
  logout,
}: DimaAppViewProps) {
  const nav = navForRole(role, t);
  const [adminNotifs, setAdminNotifs] = useState<AdminNotification[]>([]);

  useEffect(() => {
    if (role !== "ADMIN" || !isFirebaseConfigured()) return;
    const unsub = subscribeAdminNotifications(setAdminNotifs);
    return () => unsub();
  }, [role]);

  const adminUnread = useMemo(() => adminNotifs.filter((n) => !n.read).length, [adminNotifs]);

  return (
    <div
      className={cn("min-h-screen font-sans transition-colors duration-500", isRTL ? "font-arabic" : "font-sans")}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "linear-gradient(180deg, #ecfdf3 0%, #f0f4f0 45%, #e8f5ec 100%)" }}
    >
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col p-4 md:p-8 relative z-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 shrink-0">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-wrap">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-600 border border-white/80 shrink-0">
              <TreeDeciduous size={30} />
            </div>
            <div className="min-w-0">
              <h1
                className={cn(
                  "text-2xl md:text-3xl font-black text-zinc-900 tracking-tighter leading-none",
                  !isRTL && "uppercase",
                )}
              >
                {t("Gabes bin ydik", "ڤَابس بين يديك")}
              </h1>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SMART_CITY_GBS
              </p>
            </div>
            {role === "ADMIN" ? (
              <button
                type="button"
                onClick={() => setActiveTab("admin-alerts")}
                className="relative shrink-0 flex items-center gap-2 rounded-2xl border-2 border-violet-300 bg-violet-50 px-3 py-2.5 sm:px-4 text-violet-900 shadow-md hover:bg-violet-100 transition-colors"
                title={t("Signalements & notifications", "التبليغات والإشعارات")}
                aria-label={t("Signalements & notifications", "التبليغات والإشعارات")}
              >
                <Bell size={22} strokeWidth={2.5} className="text-violet-700" />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wide">
                  {t("Alertes", "تنبيهات")}
                </span>
                {adminUnread > 0 ? (
                  <span className="absolute -top-1.5 -end-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center leading-none border-2 border-white shadow tabular-nums">
                    {adminUnread > 99 ? "99+" : adminUnread}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-md p-3 rounded-full border border-white/80 shadow-sm">
            {userEmail && (
              <span className="hidden sm:inline max-w-[200px] truncate text-[10px] font-bold text-zinc-500 px-2" title={userEmail}>
                {userEmail}
              </span>
            )}
            <span
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-black uppercase shrink-0 border",
                role === "ADMIN"
                  ? "bg-violet-100 text-violet-800 border-violet-200"
                  : role === "CITIZEN"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-zinc-900 text-white border-transparent",
              )}
            >
              {role === "ADMIN"
                ? t("Espace admin", "فضاء الإدارة")
                : role === "CITIZEN"
                  ? t("Espace citoyen", "فضاء المواطن")
                  : t("Espace agriculteur", "فضاء الفلاح")}
            </span>

            <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

            <div className="flex bg-zinc-200/40 p-1 rounded-full overflow-hidden">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={cn("px-4 py-2 rounded-full text-[10px] font-black transition-all", lang === "fr" ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400")}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("ar")}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black transition-all font-arabic",
                  lang === "ar" ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400",
                )}
              >
                AR
              </button>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              {t("Déconnexion", "خروج")}
            </button>
          </div>
        </header>

        {role === "ADMIN" && adminUnread > 0 ? (
          <button
            type="button"
            onClick={() => setActiveTab("admin-alerts")}
            className="w-full mb-6 flex items-center justify-between gap-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/95 px-5 py-4 text-left shadow-md shadow-amber-100/50 hover:bg-amber-100/95 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Bell size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-amber-900">
                  {t("Nouvelles notifications", "إشعارات جديدة")}
                </p>
                <p className="text-xs font-bold text-amber-950/90 mt-0.5">
                  {adminUnread === 1
                    ? t("1 signalement ou alerte non lue — ouvrir pour consulter.", "تبليغ أو تنبيه واحد غير مقروء.")
                    : t(`${adminUnread} signalements ou alertes non lus — ouvrir pour consulter.`, `${adminUnread} تبليغات غير مقروءة.`)}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-black uppercase text-amber-800 underline-offset-2">
              {t("Voir", "عرض")}
            </span>
          </button>
        ) : null}

        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-[22rem] shrink-0 lg:sticky lg:top-8 max-h-[min(70vh,32rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 -mr-1">
            <nav className="flex flex-col gap-2.5 pb-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-4 py-4 px-5 rounded-full transition-all relative border text-left shadow-sm",
                      isRTL && "text-right flex-row-reverse",
                      active
                        ? "bg-white border-white text-emerald-600 shadow-md"
                        : "bg-white/35 border-white/50 text-zinc-500 hover:bg-white/55 hover:text-zinc-700",
                    )}
                  >
                    <Icon size={20} className={cn("shrink-0", active ? "text-emerald-600" : "text-zinc-400")} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-snug flex-1">{item.label}</span>
                    {item.id === "admin-alerts" && adminUnread > 0 ? (
                      <span
                        className="shrink-0 min-h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center tabular-nums border border-white shadow-sm"
                        aria-label={String(adminUnread)}
                      >
                        {adminUnread > 99 ? "99+" : adminUnread}
                      </span>
                    ) : active ? (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
                    ) : (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-transparent" aria-hidden />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 w-full min-h-[560px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${role}-${activeTab}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.28, ease: "circOut" }}
                className="h-full"
              >
                {role === "CITIZEN" && (
                  <>
                    {activeTab === "forum" && (
                      <ForumFirestorePanel t={t} isRTL={isRTL} userUid={userUid} userEmail={userEmail} viewerRole={role} isAdmin={false} />
                    )}
                    {activeTab === "reclamation" && <SpaceReclamationView t={t} variant="citizen" userUid={userUid} userEmail={userEmail} />}
                    {activeTab === "chat" && <Chatbot t={t} isRTL={isRTL} />}
                    {activeTab === "news" && <SpaceNewsView t={t} />}
                    {activeTab === "pollution" && (
                      <div className="space-y-4">
                        <div className="rounded-[2rem] bg-white/70 border border-white px-6 py-4 shadow-sm">
                          <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                            <Wind className="text-emerald-600" size={22} />
                            {t("Alerte qualité de l’air & heatmap", "تنبيه جودة الهواء والخريطة الحرارية")}
                          </h2>
                          <p className="text-xs text-zinc-500 font-bold mt-1">
                            {t("Visualisation indicative (PM2.5, zones sensibles).", "عرض توضيحي (جسيمات، مناطق حساسة).")}
                          </p>
                        </div>
                        <EnvironmentalMap t={t} />
                      </div>
                    )}
                    {activeTab === "donations" && <DonationView t={t} isRTL={isRTL} />}
                    {activeTab === "profile" && <ProfileView t={t} userUid={userUid} userEmail={userEmail} />}
                  </>
                )}

                {role === "FARMER" && (
                  <>
                    {activeTab === "capteur" && <FarmerSoilSensorView t={t} />}
                    {activeTab === "eau" && <FarmerWaterWasteView t={t} />}
                    {activeTab === "market" && <FarmerMarketplace t={t} userUid={userUid} userEmail={userEmail} />}
                    {activeTab === "reclamation" && (
                      <SpaceReclamationView t={t} variant="citizen" userUid={userUid} userEmail={userEmail} />
                    )}
                    {activeTab === "forum" && (
                      <ForumFirestorePanel t={t} isRTL={isRTL} userUid={userUid} userEmail={userEmail} viewerRole={role} isAdmin={false} />
                    )}
                    {activeTab === "news" && <SpaceNewsView t={t} />}
                    {activeTab === "profile" && <ProfileView t={t} userUid={userUid} userEmail={userEmail} />}
                  </>
                )}

                {role === "ADMIN" && (
                  <>
                    {activeTab === "reclamations" && (
                      <SpaceReclamationView t={t} variant="admin" userUid={userUid} userEmail={userEmail} />
                    )}
                    {activeTab === "forum" && (
                      <ForumFirestorePanel t={t} isRTL={isRTL} userUid={userUid} userEmail={userEmail} viewerRole={role} isAdmin />
                    )}
                    {activeTab === "admin-alerts" && <AdminAlertsPanel t={t} items={adminNotifs} />}
                    {activeTab === "events" && <AdminEventsPanel t={t} events={events} />}
                    {activeTab === "stats" && <AdminStatsPanel t={t} />}
                    {activeTab === "admin-news" && <AdminNewsPanel t={t} authorUid={userUid} />}
                    {activeTab === "admin-donations" && <AdminDonationProjectsPanel t={t} authorUid={userUid} />}
                    {activeTab === "profile" && <ProfileView t={t} userUid={userUid} userEmail={userEmail} />}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <footer className="mt-16 pt-8 border-t border-emerald-200/40 flex flex-col md:flex-row justify-between items-center gap-6 pb-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              © 2026 {t("Gabes bin ydik", "ڤَابس بين يديك")}
            </span>
            <div className="h-4 w-px bg-zinc-200" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("Smart City", "مدينة ذكية")}</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end text-[10px] font-black text-zinc-400 uppercase tracking-tighter items-center">
            <button type="button" onClick={logout} className="hover:text-emerald-600 transition-colors flex items-center gap-2">
              <LogOut size={14} />
              {t("Déconnexion", "خروج")}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

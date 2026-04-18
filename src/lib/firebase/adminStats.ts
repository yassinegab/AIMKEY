import { collection, getCountFromServer, getDocs, limit, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { COL } from "@/lib/firebase/collections";

export type AdminDashboardStats = {
  users: number;
  news: number;
  reclamations: number;
  forumPosts: number;
  marketplaceProducts: number;
  donationTotalTnd: number;
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const db = getFirebaseDb();
  const [users, news, reclamations, forumPosts, marketplaceProducts, donationSnap] = await Promise.all([
    getCountFromServer(collection(db, COL.users)),
    getCountFromServer(collection(db, COL.news)),
    getCountFromServer(collection(db, COL.reclamations)),
    getCountFromServer(collection(db, COL.forumPosts)),
    getCountFromServer(collection(db, COL.marketplaceProducts)),
    getDocs(query(collection(db, COL.donationProjects), limit(500))),
  ]);
  let donationTotalTnd = 0;
  donationSnap.forEach((d) => {
    donationTotalTnd += Number(d.data().current ?? 0) || 0;
  });
  return {
    users: users.data().count,
    news: news.data().count,
    reclamations: reclamations.data().count,
    forumPosts: forumPosts.data().count,
    marketplaceProducts: marketplaceProducts.data().count,
    donationTotalTnd,
  };
}

import { PublicationData } from "@/features/dashboard/types";

// Total unique publications = 124 + 286 + 390 + 215 + 60 = 1 075
export const PUBLICATIONS_MOCK: PublicationData[] = [
  { id: "q1", category: "Q1 jurnal maqolalari (Scopus / WoS)", count: 124, percentage: 11.5, color: "#10B981" },
  { id: "scopus_other", category: "Q1 bo'lmagan Scopus maqolalari", count: 286, percentage: 26.6, color: "#2563EB" },
  { id: "peer_reviewed", category: "Boshqa xalqaro / OAK jurnallari", count: 390, percentage: 36.3, color: "#4F46E5" },
  { id: "conf_proceedings", category: "Konferensiya materiallari", count: 215, percentage: 20.0, color: "#06B6D4" },
  { id: "monographs_patents", category: "Boshqa nashrlar (Monografiya / Patent)", count: 60, percentage: 5.6, color: "#F59E0B" },
];

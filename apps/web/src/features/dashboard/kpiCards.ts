import { Building2, GraduationCap, Users, type LucideIcon } from "lucide-react";
import type { DormitorySupplyData, KpiSummary } from "./types";

/** Single source of truth for the headline KPI cards (dashboard and presentation mode). */
export interface KpiCardConfig {
  id: "students" | "faculties" | "teachers";
  title: string;
  unit: string;
  valueKey: keyof Pick<KpiSummary, "totalStudents" | "totalFaculties" | "totalTeachers">;
  icon: LucideIcon;
  accent: "blue" | "green" | "indigo";
  trendText: string;
  subMetrics: { label: string; value: string }[];
}

export const KPI_CARDS: KpiCardConfig[] = [
  {
    id: "students",
    title: "Talabalar",
    unit: "nafar",
    valueKey: "totalStudents",
    icon: GraduationCap,
    accent: "blue",
    trendText: "+7.4% o'sish",
    subMetrics: [
      { label: "Bakalavr", value: "22 200" },
      { label: "Magistr", value: "2 050" },
      { label: "Doktorant", value: "250" },
    ],
  },
  {
    id: "faculties",
    title: "Fakultetlar",
    unit: "ta",
    valueKey: "totalFaculties",
    icon: Building2,
    accent: "green",
    trendText: "100% akkreditatsiya",
    subMetrics: [
      { label: "Kafedralar", value: "54 ta" },
      { label: "Yo'nalishlar", value: "68 ta" },
      { label: "Mutaxassislik", value: "32 ta" },
    ],
  },
  {
    id: "teachers",
    title: "O'qituvchilar",
    unit: "nafar",
    valueKey: "totalTeachers",
    icon: Users,
    accent: "indigo",
    trendText: "Ilmiy salohiyat: 44%",
    subMetrics: [
      { label: "Fan doktori", value: "85 nafar" },
      { label: "Falsafa doktori", value: "465 nafar" },
      { label: "Prof. / dots.", value: "420 nafar" },
    ],
  },
];

/** Ring segments for dormitory supply (provided vs not provided). */
export function buildDormSupplySegments(supply?: DormitorySupplyData) {
  if (!supply) return [];
  return [
    {
      id: "provided",
      name: "Ta'minlangan",
      count: supply.providedCount,
      percentage: supply.providedRate,
      color: "#539883",
    },
    {
      id: "unprovided",
      name: "Ta'minlanmagan",
      count: supply.unprovidedCount,
      percentage: Number((100 - supply.providedRate).toFixed(1)),
      color: "#B95E6D",
    },
  ];
}

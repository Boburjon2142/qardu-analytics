import { DashboardDataset, PeriodOption, ReportingPeriod } from "@/features/dashboard/types";
import {
  STUDENTS_BY_FACULTY_MOCK,
  STUDENTS_BY_LEVEL_MOCK,
  DORMITORY_SUPPLY_MOCK,
  STUDENTS_BY_TYPE_MOCK,
  STUDENTS_BY_COURSE_MOCK,
} from "./students.mock";
import {
  TEACHERS_BY_TITLE_MOCK,
  TEACHERS_BY_DEGREE_MOCK,
  TEACHERS_BY_FACULTY_MOCK,
} from "./teachers.mock";
import {
  BUILDINGS_CAPACITY_MOCK,
  DORMITORIES_CAPACITY_MOCK,
} from "./infrastructure.mock";
import { PUBLICATIONS_MOCK } from "./research.mock";

export const REPORTING_PERIOD_OPTIONS: PeriodOption[] = [
  { id: "2024-2025", label: "2024–2025 o'quv yili" },
  { id: "2023-2024", label: "2023–2024 o'quv yili" },
  { id: "2022-2023", label: "2022–2023 o'quv yili" },
];

export const CURRENT_DATASET_MOCK: DashboardDataset = {
  period: "2024-2025",
  kpi: {
    totalStudents: 24500,
    totalFaculties: 12,
    totalTeachers: 1250,
    lastUpdated: "Bugun, 18:30 (Avtomatik yangilangan)",
  },
  students: {
    byFaculty: STUDENTS_BY_FACULTY_MOCK,
    byLevel: STUDENTS_BY_LEVEL_MOCK,
    dormitorySupply: DORMITORY_SUPPLY_MOCK,
    byType: STUDENTS_BY_TYPE_MOCK,
    byCourse: STUDENTS_BY_COURSE_MOCK,
  },
  infrastructure: {
    buildings: BUILDINGS_CAPACITY_MOCK,
    dormitories: DORMITORIES_CAPACITY_MOCK,
  },
  teachersAndResearch: {
    byTitle: TEACHERS_BY_TITLE_MOCK,
    byDegree: TEACHERS_BY_DEGREE_MOCK,
    publications: PUBLICATIONS_MOCK,
    byFaculty: TEACHERS_BY_FACULTY_MOCK,
  },
};

/**
 * Historical variations for filter switching simulation
 */
export const getDatasetByPeriod = (period: ReportingPeriod): DashboardDataset => {
  if (period === "2023-2024") {
    return {
      period: "2023-2024",
      kpi: {
        totalStudents: 22800,
        totalFaculties: 12,
        totalTeachers: 1180,
        lastUpdated: "12.06.2024",
      },
      students: {
        byFaculty: STUDENTS_BY_FACULTY_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.93),
        })),
        byLevel: STUDENTS_BY_LEVEL_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.93),
        })),
        dormitorySupply: {
          providedCount: 3800,
          unprovidedCount: 1200,
          totalDemand: 5000,
          providedRate: 76.0,
        },
        byType: STUDENTS_BY_TYPE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.93),
        })),
        byCourse: STUDENTS_BY_COURSE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.93),
        })),
      },
      infrastructure: {
        buildings: BUILDINGS_CAPACITY_MOCK,
        dormitories: DORMITORIES_CAPACITY_MOCK,
      },
      teachersAndResearch: {
        byTitle: TEACHERS_BY_TITLE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.94),
        })),
        byDegree: TEACHERS_BY_DEGREE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.94),
        })),
        publications: PUBLICATIONS_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.88),
        })),
        byFaculty: TEACHERS_BY_FACULTY_MOCK.map((item) => ({
          ...item,
          teacherCount: Math.round(item.teacherCount * 0.94),
        })),
      },
    };
  }

  if (period === "2022-2023") {
    return {
      period: "2022-2023",
      kpi: {
        totalStudents: 20400,
        totalFaculties: 11,
        totalTeachers: 1090,
        lastUpdated: "25.06.2023",
      },
      students: {
        byFaculty: STUDENTS_BY_FACULTY_MOCK.slice(0, 11).map((item) => ({
          ...item,
          count: Math.round(item.count * 0.83),
        })),
        byLevel: STUDENTS_BY_LEVEL_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.83),
        })),
        dormitorySupply: {
          providedCount: 3400,
          unprovidedCount: 1350,
          totalDemand: 4750,
          providedRate: 71.6,
        },
        byType: STUDENTS_BY_TYPE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.83),
        })),
        byCourse: STUDENTS_BY_COURSE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.83),
        })),
      },
      infrastructure: {
        buildings: BUILDINGS_CAPACITY_MOCK,
        dormitories: DORMITORIES_CAPACITY_MOCK.slice(0, 4),
      },
      teachersAndResearch: {
        byTitle: TEACHERS_BY_TITLE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.87),
        })),
        byDegree: TEACHERS_BY_DEGREE_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.87),
        })),
        publications: PUBLICATIONS_MOCK.map((item) => ({
          ...item,
          count: Math.round(item.count * 0.72),
        })),
        byFaculty: TEACHERS_BY_FACULTY_MOCK.slice(0, 11).map((item) => ({
          ...item,
          teacherCount: Math.round(item.teacherCount * 0.87),
        })),
      },
    };
  }

  return CURRENT_DATASET_MOCK;
};

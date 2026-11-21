import {
  FacultyStudentData,
  EducationLevelData,
  DormitorySupplyData,
  EducationTypeData,
  CourseData,
} from "@/features/dashboard/types";

// Faculty color palette for distinct elegant visualization
const FACULTY_COLORS = [
  "#3B5BA9", // Blue
  "#C9954A", // Amber
  "#4E9A83", // Green
  "#B8648A", // Rose
  "#4A9BB0", // Cyan
  "#C27A4E", // Orange
  "#7C6BB0", // Purple
  "#8A9A3B", // Olive
  "#9C5B54", // Brick
  "#6D7B8D", // Slate
  "#2E7D8C", // Deep teal
  "#8E4F8F", // Plum
];

// Sum = 24 500
export const STUDENTS_BY_FACULTY_MOCK: FacultyStudentData[] = [
  { id: "mat-comp", name: "Matematika va kompyuter ilmlari", shortName: "Matematika va KI", count: 2450, percentage: 10.0, color: FACULTY_COLORS[0] },
  { id: "phys-tech", name: "Fizika va texnologik ta'lim", shortName: "Fizika va TT", count: 1820, percentage: 7.4, color: FACULTY_COLORS[1] },
  { id: "chem-bio", name: "Kimyo va biologiya", shortName: "Kimyo-biologiya", count: 2100, percentage: 8.6, color: FACULTY_COLORS[2] },
  { id: "geo-agro", name: "Geografiya va agronomiya", shortName: "Geografiya", count: 1650, percentage: 6.7, color: FACULTY_COLORS[3] },
  { id: "hist-phil", name: "Tarix va falsafa", shortName: "Tarix", count: 1980, percentage: 8.1, color: FACULTY_COLORS[4] },
  { id: "uzb-phil", name: "O'zbek filologiyasi", shortName: "O'zbek filologiyasi", count: 2340, percentage: 9.6, color: FACULTY_COLORS[5] },
  { id: "for-lang", name: "Xorijiy tillar", shortName: "Xorijiy tillar", count: 2680, percentage: 10.9, color: FACULTY_COLORS[6] },
  { id: "pedagogy", name: "Pedagogika", shortName: "Pedagogika", count: 2520, percentage: 10.3, color: FACULTY_COLORS[7] },
  { id: "arts", name: "San'atshunoslik", shortName: "San'atshunoslik", count: 1180, percentage: 4.8, color: FACULTY_COLORS[8] },
  { id: "phys-cult", name: "Jismoniy madaniyat", shortName: "Jismoniy madaniyat", count: 1540, percentage: 6.3, color: FACULTY_COLORS[9] },
  { id: "econ-tour", name: "Iqtisodiyot va turizm", shortName: "Iqtisodiyot", count: 2760, percentage: 11.3, color: FACULTY_COLORS[10] },
  { id: "law", name: "Huquqshunoslik", shortName: "Huquqshunoslik", count: 1480, percentage: 6.0, color: FACULTY_COLORS[11] },
];

// Sum = 24 500
export const STUDENTS_BY_LEVEL_MOCK: EducationLevelData[] = [
  { id: "bachelor", name: "Bakalavriat", count: 22200, percentage: 90.6, color: "#3B5BA9" },
  { id: "master", name: "Magistratura", count: 2050, percentage: 8.4, color: "#5B5FA8" },
  { id: "phd", name: "Doktorantura", count: 250, percentage: 1.0, color: "#4A9BB0" },
];

// Sum demand = 5 200, provided rate = (4120 / 5200) * 100 = 79.2%
export const DORMITORY_SUPPLY_MOCK: DormitorySupplyData = {
  providedCount: 4120,
  unprovidedCount: 1080,
  totalDemand: 5200,
  providedRate: 79.2,
};

// Sum = 24 500
export const STUDENTS_BY_TYPE_MOCK: EducationTypeData[] = [
  { id: "day", name: "Kunduzgi", count: 15200, percentage: 62.0 },
  { id: "extramural", name: "Sirtqi", count: 6800, percentage: 27.8 },
  { id: "evening", name: "Kechki", count: 1650, percentage: 6.7 },
  { id: "distance", name: "Masofaviy", count: 850, percentage: 3.5 },
];

// Sum = 24 500
export const STUDENTS_BY_COURSE_MOCK: CourseData[] = [
  { id: "c1", name: "1-kurs", count: 7150 },
  { id: "c2", name: "2-kurs", count: 6300 },
  { id: "c3", name: "3-kurs", count: 5650 },
  { id: "c4", name: "4-kurs", count: 4900 },
  { id: "c5", name: "5-kurs", count: 500 },
];

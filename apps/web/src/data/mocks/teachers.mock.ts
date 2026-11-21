import {
  AcademicTitleData,
  AcademicDegreeData,
  FacultyTeacherData,
} from "@/features/dashboard/types";

// Sum = 1 250
export const TEACHERS_BY_TITLE_MOCK: AcademicTitleData[] = [
  { id: "prof", name: "Professor", count: 75, percentage: 6.0, color: "#5B5FA8" },
  { id: "assoc_prof", name: "Dotsent", count: 345, percentage: 27.6, color: "#3B5BA9" },
  { id: "senior_res", name: "Katta ilmiy xodim", count: 95, percentage: 7.6, color: "#4A9BB0" },
  { id: "no_title", name: "Ilmiy unvonsiz (Katta o'qituvchi / Assistent)", count: 735, percentage: 58.8, color: "#94A3B8" },
];

// Sum = 1 250
export const TEACHERS_BY_DEGREE_MOCK: AcademicDegreeData[] = [
  { id: "dsc", name: "DSc (Fan doktori)", count: 85, percentage: 6.8, color: "#4E9A83" },
  { id: "phd", name: "PhD (Falsafa doktori / Fan nomzodi)", count: 465, percentage: 37.2, color: "#3B5BA9" },
  { id: "no_degree", name: "Ilmiy darajasiz", count: 700, percentage: 56.0, color: "#94A3B8" },
];

// Sum = 1 250 across all 12 faculties
export const TEACHERS_BY_FACULTY_MOCK: FacultyTeacherData[] = [
  { id: "for-lang", facultyName: "Xorijiy tillar fakulteti", shortName: "Xorijiy tillar", teacherCount: 142, dscCount: 9, phdCount: 52 },
  { id: "mat-comp", facultyName: "Matematika va kompyuter ilmlari fakulteti", shortName: "Matematika va KI", teacherCount: 135, dscCount: 12, phdCount: 56 },
  { id: "pedagogy", facultyName: "Pedagogika fakulteti", shortName: "Pedagogika", teacherCount: 128, dscCount: 8, phdCount: 46 },
  { id: "chem-bio", facultyName: "Kimyo va biologiya fakulteti", shortName: "Kimyo-biologiya", teacherCount: 120, dscCount: 11, phdCount: 49 },
  { id: "uzb-phil", facultyName: "O'zbek filologiyasi fakulteti", shortName: "O'zbek filologiyasi", teacherCount: 115, dscCount: 10, phdCount: 48 },
  { id: "econ-tour", facultyName: "Iqtisodiyot va turizm fakulteti", shortName: "Iqtisodiyot", teacherCount: 110, dscCount: 7, phdCount: 42 },
  { id: "hist-phil", facultyName: "Tarix va falsafa fakulteti", shortName: "Tarix", teacherCount: 105, dscCount: 9, phdCount: 41 },
  { id: "phys-tech", facultyName: "Fizika va texnologik ta'lim fakulteti", shortName: "Fizika va TT", teacherCount: 98, dscCount: 8, phdCount: 38 },
  { id: "geo-agro", facultyName: "Geografiya va agronomiya fakulteti", shortName: "Geografiya", teacherCount: 88, dscCount: 5, phdCount: 32 },
  { id: "phys-cult", facultyName: "Jismoniy madaniyat fakulteti", shortName: "Jismoniy madaniyat", teacherCount: 82, dscCount: 2, phdCount: 24 },
  { id: "law", facultyName: "Huquqshunoslik fakulteti", shortName: "Huquqshunoslik", teacherCount: 72, dscCount: 3, phdCount: 23 },
  { id: "arts", facultyName: "San'atshunoslik fakulteti", shortName: "San'atshunoslik", teacherCount: 55, dscCount: 1, phdCount: 14 },
];

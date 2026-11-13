export type ReportingPeriod = "2024-2025" | "2023-2024" | "2022-2023";

export interface PeriodOption {
  id: ReportingPeriod;
  label: string;
}

export interface KpiSummary {
  totalStudents: number;
  totalFaculties: number;
  totalTeachers: number;
  lastUpdated: string;
}

export interface FacultyStudentData {
  id: string;
  name: string;
  shortName: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface EducationLevelData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface DormitorySupplyData {
  providedCount: number;
  unprovidedCount: number;
  totalDemand: number;
  providedRate: number; // e.g. 78.4
}

export interface EducationTypeData {
  id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface CourseData {
  id: string;
  name: string;
  count: number;
}

export interface BuildingCapacityData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupancy: number;
}

export interface DormitoryCapacityItem {
  id: string;
  name: string;
  totalCapacity: number;
  occupiedSpots: number;
  vacantSpots: number;
}

export interface AcademicTitleData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface AcademicDegreeData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface PublicationData {
  id: string;
  category: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface FacultyTeacherData {
  id: string;
  facultyName: string;
  shortName: string;
  teacherCount: number;
  dscCount: number;
  phdCount: number;
}

export interface DashboardDataset {
  period: ReportingPeriod;
  kpi: KpiSummary;
  students: {
    byFaculty: FacultyStudentData[];
    byLevel: EducationLevelData[];
    dormitorySupply: DormitorySupplyData;
    byType: EducationTypeData[];
    byCourse: CourseData[];
  };
  infrastructure: {
    buildings: BuildingCapacityData[];
    dormitories: DormitoryCapacityItem[];
  };
  teachersAndResearch: {
    byTitle: AcademicTitleData[];
    byDegree: AcademicDegreeData[];
    publications: PublicationData[];
    byFaculty: FacultyTeacherData[];
  };
}

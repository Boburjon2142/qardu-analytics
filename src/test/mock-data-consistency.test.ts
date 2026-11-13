import { describe, it, expect } from "vitest";
import { CURRENT_DATASET_MOCK } from "@/data/mocks/dashboard.mock";
import { calculatePercentage } from "@/lib/utils";

describe("Mock Data Numerical Consistency Verification", () => {
  const { kpi, students, teachersAndResearch, infrastructure } = CURRENT_DATASET_MOCK;

  it("should have exactly 24 500 students matching KPI total", () => {
    expect(kpi.totalStudents).toBe(24500);
  });

  it("should verify students by faculty sum to exactly totalStudents (24 500)", () => {
    const facultySum = students.byFaculty.reduce((sum, item) => sum + item.count, 0);
    expect(facultySum).toBe(kpi.totalStudents);
  });

  it("should verify students by education level sum to exactly totalStudents (24 500)", () => {
    const levelSum = students.byLevel.reduce((sum, item) => sum + item.count, 0);
    expect(levelSum).toBe(kpi.totalStudents);
  });

  it("should verify students by education type sum to exactly totalStudents (24 500)", () => {
    const typeSum = students.byType.reduce((sum, item) => sum + item.count, 0);
    expect(typeSum).toBe(kpi.totalStudents);
  });

  it("should verify students by course sum to exactly totalStudents (24 500)", () => {
    const courseSum = students.byCourse.reduce((sum, item) => sum + item.count, 0);
    expect(courseSum).toBe(kpi.totalStudents);
  });

  it("should have exactly 1 250 teachers matching KPI total", () => {
    expect(kpi.totalTeachers).toBe(1250);
  });

  it("should verify teachers by academic titles sum to exactly totalTeachers (1 250)", () => {
    const titleSum = teachersAndResearch.byTitle.reduce((sum, item) => sum + item.count, 0);
    expect(titleSum).toBe(kpi.totalTeachers);
  });

  it("should verify teachers by academic degrees sum to exactly totalTeachers (1 250)", () => {
    const degreeSum = teachersAndResearch.byDegree.reduce((sum, item) => sum + item.count, 0);
    expect(degreeSum).toBe(kpi.totalTeachers);
  });

  it("should verify teachers by faculty sum to exactly totalTeachers (1 250)", () => {
    const facultyTeachersSum = teachersAndResearch.byFaculty.reduce(
      (sum, item) => sum + item.teacherCount,
      0
    );
    expect(facultyTeachersSum).toBe(kpi.totalTeachers);
  });

  it("should verify dormitory accommodation numbers are strictly consistent", () => {
    const { providedCount, unprovidedCount, totalDemand, providedRate } = students.dormitorySupply;
    
    // Sum check
    expect(providedCount + unprovidedCount).toBe(totalDemand);
    
    // Provided percentage check
    const calculatedRate = calculatePercentage(providedCount, totalDemand, 1);
    expect(calculatedRate).toBe(providedRate);
    expect(providedRate).toBe(79.2);

    // Occupied dormitory spots check
    const totalDormOccupied = infrastructure.dormitories.reduce(
      (sum, item) => sum + item.occupiedSpots,
      0
    );
    expect(totalDormOccupied).toBe(providedCount);
  });

  it("should verify unique scientific publications count without double-counting", () => {
    const totalPubs = teachersAndResearch.publications.reduce((sum, item) => sum + item.count, 0);
    expect(totalPubs).toBe(1075);
  });
});

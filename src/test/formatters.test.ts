import { describe, it, expect } from "vitest";
import { formatNumber, formatPercentage } from "@/lib/formatters";
import { calculatePercentage } from "@/lib/utils";

describe("Formatters and Calculation Utilities", () => {
  it("formats numbers according to Uzbek locale formatting", () => {
    const formatted = formatNumber(24500);
    // uz-UZ locale typically formats thousands with space or non-breaking space
    expect(formatted.replace(/\s|\u00A0/g, " ")).toBe("24 500");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
  });

  it("safely calculates percentage preventing division by zero", () => {
    expect(calculatePercentage(0, 0)).toBe(0);
    expect(calculatePercentage(100, 0)).toBe(0);
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(4120, 5200, 1)).toBe(79.2);
  });

  it("formats percentages correctly", () => {
    expect(formatPercentage(79.234)).toBe("79.2%");
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(null)).toBe("0%");
    expect(formatPercentage(undefined)).toBe("0%");
  });
});

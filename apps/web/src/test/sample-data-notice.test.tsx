import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SampleDataNotice } from "@/components/layout/SampleDataNotice";
import {
  MockDashboardRepository,
  USES_SAMPLE_DATA,
} from "@/features/dashboard/services/dashboardRepository";

describe("Sample data notice", () => {
  it("is enabled while the dashboard is backed by mock data", () => {
    expect(new MockDashboardRepository().isSampleData).toBe(true);
    expect(USES_SAMPLE_DATA).toBe(true);
  });

  it("bar variant states that the numbers are not official statistics", () => {
    render(<SampleDataNotice />);
    const note = screen.getByRole("note", { name: "Sinov ma'lumotlari" });
    expect(note).toHaveTextContent("Sinov ma'lumotlari.");
    expect(note).toHaveTextContent("rasmiy statistikasi emas");
  });

  it("badge variant is compact and keeps the full message as a tooltip", () => {
    render(<SampleDataNotice variant="badge" />);
    const badge = screen.getByRole("note");
    expect(badge).toHaveTextContent("Sinov ma'lumotlari");
    expect(badge).toHaveAttribute("title", expect.stringContaining("rasmiy statistikasi emas"));
  });
});

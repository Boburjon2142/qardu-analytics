import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FacultyMapPlaceholder } from "@/components/dashboard/FacultyMapPlaceholder";
import { GraduationCap } from "lucide-react";

describe("Dashboard UI Components", () => {
  it("renders StatCard with correct values, formatting, and badges", () => {
    render(
      <StatCard
        title="Talabalar"
        value={24500}
        subtitle="Barcha bosqichlar"
        icon={GraduationCap}
        accentColor="blue"
        badgeText="Faol"
      />
    );

    expect(screen.getByText("Talabalar")).toBeInTheDocument();
    expect(screen.getByText("Barcha bosqichlar")).toBeInTheDocument();
    expect(screen.getByText("Faol")).toBeInTheDocument();
  });

  it("renders ChartCard with loading, error, and empty states appropriately", () => {
    // 1. Loading state
    const { rerender } = render(
      <ChartCard title="Test Chart" isLoading={true}>
        <div>Chart Content</div>
      </ChartCard>
    );
    expect(screen.queryByText("Chart Content")).not.toBeInTheDocument();

    // 2. Empty state
    rerender(
      <ChartCard title="Test Chart" isEmpty={true}>
        <div>Chart Content</div>
      </ChartCard>
    );
    expect(
      screen.getByText("Ushbu toifada hozircha ma'lumot mavjud emas")
    ).toBeInTheDocument();

    // 3. Error state with retry callback
    const retryFn = vi.fn();
    rerender(
      <ChartCard
        title="Test Chart"
        isError={true}
        errorMessage="Xatolik yuz berdi"
        onRetry={retryFn}
      >
        <div>Chart Content</div>
      </ChartCard>
    );
    expect(screen.getByText("Xatolik yuz berdi")).toBeInTheDocument();
    const retryBtn = screen.getByText("Qayta urinish");
    fireEvent.click(retryBtn);
    expect(retryFn).toHaveBeenCalledTimes(1);

    // 4. Normal loaded state
    rerender(
      <ChartCard title="Test Chart">
        <div>Chart Content</div>
      </ChartCard>
    );
    expect(screen.getByText("Chart Content")).toBeInTheDocument();
  });

  it("renders FacultyMapPlaceholder with the exact specified title and text", () => {
    render(<FacultyMapPlaceholder />);

    expect(
      screen.getByText("Fakultetlarning hududiy joylashuvi")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Fakultetlarning joylashuvi va talabalar statistikasi keyingi bosqichda ko'rsatiladi."
      )
    ).toBeInTheDocument();
  });
});

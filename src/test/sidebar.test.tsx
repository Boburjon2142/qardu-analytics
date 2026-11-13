import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSidebar } from "@/components/layout/AppSidebar";

describe("AppSidebar Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all 5 required navigation items", () => {
    render(<AppSidebar mobileOpen={false} onMobileClose={() => {}} />);

    expect(screen.getByText("Bosh sahifa")).toBeInTheDocument();
    expect(screen.getByText("Talabalar")).toBeInTheDocument();
    expect(screen.getByText("Fakultetlar")).toBeInTheDocument();
    expect(screen.getByText("O'qituvchilar")).toBeInTheDocument();
    expect(screen.getByText("Ilmiy faoliyat")).toBeInTheDocument();
  });

  it("is collapsed by default and persists expanded toggle in localStorage", () => {
    render(<AppSidebar mobileOpen={false} onMobileClose={() => {}} />);

    const toggleBtn = screen.getByLabelText("Sidebar-ni kengaytirish");
    expect(toggleBtn).toBeInTheDocument();

    // Click toggle to expand
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem("qardu_sidebar_collapsed")).toBe("false");

    // Click again to collapse
    const collapseBtn = screen.getByLabelText("Sidebar-ni ixchamlashtirish");
    fireEvent.click(collapseBtn);
    expect(localStorage.getItem("qardu_sidebar_collapsed")).toBe("true");
  });

  it("calls onMobileClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<AppSidebar mobileOpen={true} onMobileClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});

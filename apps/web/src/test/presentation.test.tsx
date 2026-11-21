import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { computeStage, PresentationMode } from "@/components/presentation/PresentationMode";
import { SLIDES } from "@/components/presentation/slides";
import { dashboardRepository } from "@/features/dashboard/services/dashboardRepository";
import type { DashboardDataset } from "@/features/dashboard/types";

let data: DashboardDataset;

beforeAll(async () => {
  data = await dashboardRepository.getDashboardData("2024-2025");
  // jsdom has no ResizeObserver; the slides only need it to exist.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

describe("computeStage", () => {
  it("scales a landscape stage to fill a 16:9 display exactly", () => {
    const s = computeStage(1920, 1080);
    expect(s.stage).toBe(true);
    expect(s.wide).toBe(true);
    expect(s.height).toBe(810);
    expect(s.scale).toBeCloseTo(1.254, 2);
    // The scaled stage never exceeds the viewport.
    expect(s.width * s.scale).toBeLessThanOrEqual(1920 + 1);
    expect(s.height * s.scale).toBeLessThanOrEqual(s.availableHeight + 1);
  });

  it("uses a portrait stage for tablets held upright", () => {
    const s = computeStage(768, 1024);
    expect(s.stage).toBe(true);
    expect(s.wide).toBe(false);
    expect(s.width).toBe(720);
  });

  it("falls back to natural scrolling on phones and very flat viewports", () => {
    for (const [w, h] of [
      [390, 844],
      [844, 390],
      [1000, 560],
    ]) {
      const s = computeStage(w, h);
      expect(s.stage).toBe(false);
      expect(s.scale).toBe(1);
    }
  });

  it("never lets a stage shrink below 70% (unreadable text)", () => {
    for (const [w, h] of [
      [720, 700],
      [1100, 600],
      [2560, 1440],
      [1280, 720],
      [3440, 1440],
    ]) {
      const s = computeStage(w, h);
      if (s.stage) expect(s.scale).toBeGreaterThanOrEqual(0.7);
    }
  });
});

describe("PresentationMode", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    document.body.style.overflow = "";
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const open = () =>
    render(<PresentationMode data={data} periodLabel="2024–2025 o'quv yili" onClose={onClose} />);

  it("renders an accessible dialog on the first slide", () => {
    open();
    const dialog = screen.getByRole("dialog", { name: "Taqdimot rejimi" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { level: 2, name: SLIDES[0].title })).toBeInTheDocument();
    expect(screen.getByText(/2024–2025 o'quv yili/)).toBeInTheDocument();
    expect(screen.getByText("24 500")).toBeInTheDocument(); // KPI value from the dataset
  });

  it("navigates with buttons, arrows, Home/End and wraps around", () => {
    open();
    const title = () => screen.getByRole("heading", { level: 2 }).textContent;
    fireEvent.click(screen.getByRole("button", { name: "Keyingi slayd" }));
    expect(title()).toBe(SLIDES[1].title);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(title()).toBe(SLIDES[2].title);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(title()).toBe(SLIDES[1].title);
    fireEvent.keyDown(window, { key: "End" });
    expect(title()).toBe(SLIDES[SLIDES.length - 1].title);
    fireEvent.keyDown(window, { key: "ArrowRight" }); // wraps to the first
    expect(title()).toBe(SLIDES[0].title);
    fireEvent.click(screen.getByRole("button", { name: "Oldingi slayd" })); // wraps back
    expect(title()).toBe(SLIDES[SLIDES.length - 1].title);
    fireEvent.keyDown(window, { key: "Home" });
    expect(title()).toBe(SLIDES[0].title);
  });

  it("jumps to a slide from the dot navigation", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: `4-slayd: ${SLIDES[3].title}` }));
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[3].title);
    expect(
      screen.getByRole("button", { name: `4-slayd: ${SLIDES[3].title}` })
    ).toHaveAttribute("aria-current", "true");
  });

  it("closes once on Escape or the exit button", () => {
    const { unmount } = open();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    onClose.mockReset();
    open();
    fireEvent.click(screen.getByRole("button", { name: "Taqdimot rejimidan chiqish" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks page scroll while open and restores it afterwards", () => {
    document.body.style.overflow = "auto";
    const { unmount } = open();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("closes when the browser leaves fullscreen", () => {
    let element: Element | null = document.documentElement;
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => element,
    });
    open(); // already fullscreen at mount
    element = null;
    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null });
  });

  it("autoplay is off by default, toggles, and advances on a timer", () => {
    vi.useFakeTimers();
    open();
    const toggle = screen.getByRole("button", { name: "Avtomatik almashtirish" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[0].title);

    fireEvent.click(toggle);
    expect(
      screen.getByRole("button", { name: "Avtomatik almashtirishni to'xtatish" })
    ).toHaveAttribute("aria-pressed", "true");
    act(() => {
      vi.advanceTimersByTime(12_000);
    });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[1].title);

    fireEvent.click(screen.getByRole("button", { name: "Avtomatik almashtirishni to'xtatish" }));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[1].title);
  });

  it("swipes between slides on touch devices", () => {
    open();
    const dialog = screen.getByRole("dialog");
    const surface = dialog.firstElementChild as HTMLElement;
    fireEvent.touchStart(surface, { touches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 120, clientY: 210 }] });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[1].title);
    // A mostly vertical drag is a scroll, not a swipe.
    fireEvent.touchStart(surface, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(surface, { changedTouches: [{ clientX: 120, clientY: 400 }] });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(SLIDES[1].title);
  });
});

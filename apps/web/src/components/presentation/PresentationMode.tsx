"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import type { DashboardDataset } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";
import { exitFullscreen, isFullscreen } from "./fullscreen";
import { SLIDES, type SlideContext } from "./slides";

const BAR_HEIGHT = 64;
const AUTOPLAY_MS = 12_000;

export interface StageLayout {
  /** Fixed-size scaled stage (true) or natural scrolling layout (false, phones). */
  stage: boolean;
  wide: boolean;
  /** Stage design size in CSS px (equals the available area when not a stage). */
  width: number;
  height: number;
  scale: number;
  /** Height available above the control bar. */
  availableHeight: number;
}

/**
 * Pure layout rule. Large screens render a fixed design stage (1440x810-like for landscape,
 * 720 wide for portrait) scaled to fit, so text and charts keep their proportions on any
 * display. Small or very flat viewports fall back to a natural scrolling layout at scale 1,
 * because shrinking the stage would make text unreadable.
 */
export function computeStage(viewportW: number, viewportH: number): StageLayout {
  const availableHeight = Math.max(viewportH - BAR_HEIGHT, 200);
  const natural: StageLayout = {
    stage: false,
    wide: viewportW >= 900,
    width: viewportW,
    height: availableHeight,
    scale: 1,
    availableHeight,
  };
  if (viewportW < 720 || availableHeight < 480) return natural;

  const aspect = viewportW / availableHeight;
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const landscape = aspect >= 1.15;
  const width = landscape ? clamp(Math.round(810 * aspect), 1100, 2000) : 720;
  const height = landscape ? 810 : clamp(Math.round(720 / aspect), 900, 1700);
  const scale = Math.min(viewportW / width, availableHeight / height);
  if (scale < 0.7) return natural;
  return { stage: true, wide: landscape, width, height, scale, availableHeight };
}

function useViewport() {
  const [size, setSize] = useState({ w: 1280, h: 720 });
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return size;
}

interface PresentationModeProps {
  data: DashboardDataset;
  periodLabel: string;
  onClose: () => void;
}

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function PresentationMode({ data, periodLabel, onClose }: PresentationModeProps) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const viewport = useViewport();
  const layout = useMemo(() => computeStage(viewport.w, viewport.h), [viewport]);
  const rootRef = useRef<HTMLDivElement>(null);
  const closedRef = useRef(false);
  const enteredFullscreenRef = useRef(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const total = SLIDES.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const close = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    exitFullscreen();
    onClose();
  }, [onClose]);

  // Lock page scroll, move focus into the dialog, and restore both on exit.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    rootRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  // Closing fullscreen from the browser (Esc, F11, gesture) also closes the presentation.
  useEffect(() => {
    const onChange = () => {
      if (isFullscreen()) enteredFullscreenRef.current = true;
      else if (enteredFullscreenRef.current) close();
    };
    onChange();
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const onButton = (e.target as HTMLElement | null)?.closest?.("button");
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          next();
          break;
        case " ":
          if (onButton) return; // let the focused button handle Space itself
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          setIndex(0);
          break;
        case "End":
          e.preventDefault();
          setIndex(total - 1);
          break;
        case "Tab": {
          const focusables = rootRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
          if (!focusables || focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;
          if (e.shiftKey && (active === first || active === rootRef.current)) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, next, prev, total]);

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  const slide = SLIDES[index];
  const ctx: SlideContext = { data, wide: layout.wide, stage: layout.stage };

  const frame = (
    <div
      key={slide.id}
      className={cn(
        "slide-enter flex flex-col gap-4",
        layout.stage ? "h-full p-6" : "min-h-full p-4 sm:p-5"
      )}
    >
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
            QarshiDU Statistika · {periodLabel}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {slide.title}
          </h2>
        </div>
        <Image
          src="/assets/logo-oz-dark-text.svg"
          alt="QarshiDU logotipi"
          width={84}
          height={48}
          className="hidden shrink-0 sm:block"
          priority
        />
      </header>
      {slide.render(ctx)}
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Taqdimot rejimi"
      tabIndex={-1}
      className="no-print fixed inset-0 z-[100] flex h-dvh flex-col bg-canvas text-slate-900 outline-none"
    >
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {layout.stage ? (
          <div
            style={{
              position: "absolute",
              width: layout.width,
              height: layout.height,
              left: (viewport.w - layout.width * layout.scale) / 2,
              top: (layout.availableHeight - layout.height * layout.scale) / 2,
              transform: `scale(${layout.scale})`,
              transformOrigin: "top left",
            }}
          >
            {frame}
          </div>
        ) : (
          <div className="h-full overflow-y-auto overscroll-contain">{frame}</div>
        )}
      </div>

      <footer
        className="relative flex shrink-0 items-center justify-between gap-3 border-t border-border bg-white px-3 sm:px-5"
        style={{ height: BAR_HEIGHT, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {autoplay && (
          <span
            key={index}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 origin-left bg-primary"
            style={{ animation: `slideProgress ${AUTOPLAY_MS}ms linear forwards` }}
          />
        )}

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700" aria-live="polite">
          <span className="tabular-nums">
            {index + 1} / {total}
          </span>
          <span className="ml-2 hidden font-medium text-slate-500 lg:inline">{slide.title}</span>
          <span className="sr-only">. {slide.title}</span>
        </p>

        <div className="flex items-center gap-1.5">
          <button type="button" className={iconButton} onClick={prev} aria-label="Oldingi slayd">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(iconButton, autoplay && "border-primary bg-primary/10 text-primary")}
            onClick={() => setAutoplay((v) => !v)}
            aria-pressed={autoplay}
            aria-label={autoplay ? "Avtomatik almashtirishni to'xtatish" : "Avtomatik almashtirish"}
            title={autoplay ? "Avtomatik almashtirishni to'xtatish" : "Avtomatik almashtirish"}
          >
            {autoplay ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <button type="button" className={iconButton} onClick={next} aria-label="Keyingi slayd">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="hidden items-center md:flex" role="group" aria-label="Slaydlar">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}-slayd: ${s.title}`}
                aria-current={i === index ? "true" : undefined}
                className="group p-1.5 focus:outline-none"
              >
                <span
                  className={cn(
                    "block h-2.5 rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-primary",
                    i === index ? "w-6 bg-primary" : "w-2.5 bg-slate-300 group-hover:bg-slate-400"
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Taqdimot rejimidan chiqish"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

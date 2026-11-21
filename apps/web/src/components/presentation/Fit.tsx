"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface FitSize {
  w: number;
  h: number;
}

interface FitProps {
  /** Receives the measured pixel size of the available area. */
  children: (size: FitSize) => React.ReactNode;
  /** Lower bound so content stays usable when the parent is not height-constrained. */
  minHeight?: number;
  className?: string;
}

/**
 * Fills the remaining space of a flex/grid parent and tells its child how many pixels it has,
 * so fixed-height chart components can be sized exactly to the slide.
 */
export function Fit({ children, minHeight = 240, className }: FitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<FitSize>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: Math.floor(el.clientWidth), h: Math.floor(el.clientHeight) });
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative min-h-0 min-w-0 flex-1", className)}
      style={{ minHeight }}
    >
      {size.w > 0 && size.h > 0 && <div className="absolute inset-0">{children(size)}</div>}
    </div>
  );
}

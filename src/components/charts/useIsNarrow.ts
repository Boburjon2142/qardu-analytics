"use client";

import { useEffect, useState } from "react";

/** True when the viewport is narrower than `max` px (SSR-safe, defaults to false). */
export function useIsNarrow(max = 640): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [max]);
  return narrow;
}

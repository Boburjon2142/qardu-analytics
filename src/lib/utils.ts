import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates percentage safely preventing division by zero or NaN.
 */
export function calculatePercentage(part: number, total: number, decimals: number = 1): number {
  if (!total || total <= 0 || isNaN(total) || isNaN(part)) {
    return 0;
  }
  const pct = (part / total) * 100;
  return Number(pct.toFixed(decimals));
}

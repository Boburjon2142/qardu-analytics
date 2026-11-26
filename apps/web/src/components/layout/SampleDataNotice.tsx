import React from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SampleDataNoticeProps {
  /** "bar": full-width strip above the page; "badge": compact chip (presentation slides). */
  variant?: "bar" | "badge";
  className?: string;
}

const MESSAGE =
  "Sahifadagi raqamlar namunaviy bo'lib, Qarshi davlat universitetining rasmiy statistikasi emas.";

/**
 * Marks the dashboard as showing synthetic sample data. Kept visible in print as well, so a
 * screenshot or printout cannot be mistaken for official statistics.
 */
export function SampleDataNotice({ variant = "bar", className }: SampleDataNoticeProps) {
  if (variant === "badge") {
    return (
      <span
        role="note"
        title={MESSAGE}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900",
          className
        )}
      >
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        Sinov ma&apos;lumotlari
      </span>
    );
  }

  return (
    <div
      role="note"
      aria-label="Sinov ma'lumotlari"
      className={cn(
        "flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:items-center sm:px-6 sm:text-sm",
        className
      )}
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden="true" />
      <p className="min-w-0">
        <strong className="font-semibold">Sinov ma&apos;lumotlari.</strong> {MESSAGE}
      </p>
    </div>
  );
}

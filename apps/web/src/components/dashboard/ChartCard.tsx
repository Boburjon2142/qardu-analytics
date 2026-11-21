"use client";

import React from "react";
import { AlertCircle, FileQuestion, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_THEMES, type CardAccent } from "./cardThemes";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  unit?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Section color theme (tinted gradient, accent bar). Neutral white card when omitted. */
  accent?: CardAccent;
}

export function ChartCard({
  title,
  subtitle,
  unit,
  isLoading = false,
  isEmpty = false,
  isError = false,
  errorMessage = "Ma'lumotlarni yuklashda xatolik yuz berdi.",
  onRetry,
  headerAction,
  children,
  className,
  accent,
}: ChartCardProps) {
  const theme = accent ? CARD_THEMES[accent] : null;
  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 sm:p-4 shadow-card hover:shadow-cardHover transition-shadow duration-200 flex flex-col justify-between overflow-hidden",
        theme ? [theme.surface, theme.hover] : "bg-surface border-slate-200/70",
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            {unit && (
              <span
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded-md",
                  theme ? theme.chip : "bg-slate-100 text-slate-500"
                )}
              >
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Card Body with States */}
      <div className="relative flex-1 flex flex-col justify-start w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse w-full">
            <div className="w-36 h-36 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">{errorMessage}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Qayta urinish</span>
              </button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <FileQuestion className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Ushbu toifada hozircha ma&apos;lumot mavjud emas
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

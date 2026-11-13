"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  accentColor: "blue" | "green" | "indigo";
  badgeText?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  badgeText,
  isLoading = false,
}: StatCardProps) {
  const colorMap = {
    blue: {
      border: "border-blue-100 hover:border-blue-300",
      bgGradient: "from-blue-500/5 to-transparent",
      iconBg: "bg-blue-50 text-blue-600 ring-blue-100",
      textAccent: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      glow: "group-hover:shadow-blue-500/10",
    },
    green: {
      border: "border-emerald-100 hover:border-emerald-300",
      bgGradient: "from-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      textAccent: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "group-hover:shadow-emerald-500/10",
    },
    indigo: {
      border: "border-indigo-100 hover:border-indigo-300",
      bgGradient: "from-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-50 text-indigo-600 ring-indigo-100",
      textAccent: "text-indigo-600",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      glow: "group-hover:shadow-indigo-500/10",
    },
  };

  const scheme = colorMap[accentColor];

  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl border border-slate-200 p-6 shadow-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
        </div>
        <div className="h-8 w-36 bg-slate-200 rounded mb-2" />
        <div className="h-3 w-48 bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-surface rounded-2xl border p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover overflow-hidden",
        scheme.border,
        scheme.glow
      )}
    >
      {/* Decorative subtle ambient gradient */}
      <div
        className={cn(
          "absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-60",
          scheme.bgGradient
        )}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {formatNumber(value)}
            </span>
            {badgeText && (
              <span
                className={cn(
                  "px-2 py-0.5 text-[11px] font-bold rounded-full border",
                  scheme.badge
                )}
              >
                {badgeText}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>

        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-xl ring-1 shrink-0 transition-transform duration-200 group-hover:scale-110",
            scheme.iconBg
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface SubMetricItem {
  label: string;
  value: string | number;
}

export interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  unit?: string;
  icon: LucideIcon;
  accentColor: "blue" | "green" | "indigo";
  badgeText?: string;
  trendText?: string;
  subMetrics?: SubMetricItem[];
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  unit,
  icon: Icon,
  accentColor,
  badgeText,
  trendText,
  subMetrics,
  isLoading = false,
}: StatCardProps) {
  const colorMap = {
    blue: {
      border: "border-slate-200/90 hover:border-blue-300",
      topBar: "border-t-[3px] border-t-primary",
      bgGradient: "bg-gradient-to-br from-[#E4EBF8] via-[#F1F5FB] to-white",
      iconBg: "bg-[#EEF2F9] text-[#3B5BA9] ring-1 ring-[#DCE4F2]",
      textAccent: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      glow: "hover:shadow-blue-500/10",
    },
    green: {
      border: "border-slate-200/90 hover:border-emerald-300",
      topBar: "border-t-[3px] border-t-[#4E9A83]",
      bgGradient: "bg-gradient-to-br from-[#DDEFE8] via-[#EEF7F3] to-white",
      iconBg: "bg-[#EDF5F2] text-[#3F8670] ring-1 ring-[#D9EAE3]",
      textAccent: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "hover:shadow-emerald-500/10",
    },
    indigo: {
      border: "border-slate-200/90 hover:border-indigo-300",
      topBar: "border-t-[3px] border-t-indigo-600",
      bgGradient: "bg-gradient-to-br from-[#E5E6F5] via-[#F1F1F9] to-white",
      iconBg: "bg-[#F0F0F8] text-[#5B5FA8] ring-1 ring-[#E1E2F1]",
      textAccent: "text-indigo-600",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      glow: "hover:shadow-indigo-500/10",
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
        "group relative rounded-2xl border p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover overflow-hidden flex flex-col justify-between gap-1",
        scheme.border,
        scheme.topBar,
        scheme.bgGradient,
        scheme.glow
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {title}
              </span>
              {trendText && (
                <span className="text-[11px] font-semibold text-[#3F8670] bg-[#EDF5F2] px-1.5 py-0.5 rounded-md">
                  {trendText}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {formatNumber(value)}
              </span>
              {unit && (
                <span className="text-base font-semibold text-slate-400">{unit}</span>
              )}
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
          </div>

          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105",
              scheme.iconBg
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Sub-metrics footer row */}
      {subMetrics && subMetrics.length > 0 && (
        <div className="mt-2.5 grid grid-cols-3 divide-x divide-slate-200/80 rounded-xl bg-white/70 ring-1 ring-white/80 backdrop-blur-sm py-2 text-xs relative z-10">
          {subMetrics.map((sm, idx) => (
            <div key={idx} className="flex flex-col px-3 sm:px-4">
              <span className="text-[11px] text-slate-500 font-medium leading-tight">
                {sm.label}
              </span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {sm.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

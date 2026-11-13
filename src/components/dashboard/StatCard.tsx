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
  subtitle: string;
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
      bgGradient: "from-blue-500/5 to-transparent",
      iconBg: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
      textAccent: "text-blue-600",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      glow: "hover:shadow-blue-500/10",
    },
    green: {
      border: "border-slate-200/90 hover:border-emerald-300",
      topBar: "border-t-[3px] border-t-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      textAccent: "text-emerald-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "hover:shadow-emerald-500/10",
    },
    indigo: {
      border: "border-slate-200/90 hover:border-indigo-300",
      topBar: "border-t-[3px] border-t-indigo-600",
      bgGradient: "from-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
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
        "group relative bg-surface rounded-2xl border p-5 sm:p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover overflow-hidden flex flex-col justify-between",
        scheme.border,
        scheme.topBar,
        scheme.glow
      )}
    >
      {/* Decorative ambient background accent */}
      <div
        className={cn(
          "absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-gradient-to-br blur-2xl pointer-events-none opacity-50 transition-opacity group-hover:opacity-80",
          scheme.bgGradient
        )}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {title}
              </span>
              {trendText && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  {trendText}
                </span>
              )}
            </div>
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
          </div>

          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105",
              scheme.iconBg
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Sub-metrics footer row */}
      {subMetrics && subMetrics.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs relative z-10">
          {subMetrics.map((sm, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">
                {sm.label}
              </span>
              <span className="font-bold text-slate-800 text-[11px] sm:text-xs">
                {sm.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

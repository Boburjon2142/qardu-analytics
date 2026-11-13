"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardSection({
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  children,
}: DashboardSectionProps) {
  return (
    <section className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="self-end sm:self-center">{action}</div>}
      </div>

      <div>{children}</div>
    </section>
  );
}

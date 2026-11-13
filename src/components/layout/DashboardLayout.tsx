"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { ReportingPeriod } from "@/features/dashboard/types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  period: ReportingPeriod;
  onPeriodChange: (period: ReportingPeriod) => void;
  lastUpdated?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function DashboardLayout({
  children,
  period,
  onPeriodChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("qardu_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }

    // Listen to local storage changes from sidebar toggle
    const handleStorage = () => {
      const updated = localStorage.getItem("qardu_sidebar_collapsed");
      if (updated !== null) {
        setIsCollapsed(updated === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-[margin-left] duration-200 ease-in-out min-w-0",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        )}
      >
        <AppHeader
          onMobileMenuOpen={() => setMobileOpen(true)}
          period={period}
          onPeriodChange={onPeriodChange}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
          {children}
        </main>

        {/* Footer info bar */}
        <footer className="mt-auto border-t border-border bg-white/60 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} Qarshi davlat universiteti. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Tizim holati: Barqaror
            </span>
            <span className="text-slate-300">|</span>
            <span>Platforma versiyasi: v1.0.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

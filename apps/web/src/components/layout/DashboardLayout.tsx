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
  onPresent?: () => void;
  presentDisabled?: boolean;
}

export function DashboardLayout({
  children,
  period,
  onPeriodChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onPresent,
  presentDisabled,
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
    <div className="min-h-[100dvh] bg-canvas text-slate-900 flex flex-col">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
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
          onPresent={onPresent}
          presentDisabled={presentDisabled}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-5 max-w-[106rem] w-full mx-auto">
          {children}
        </main>

        {/* Footer info bar */}
        <footer className="mt-auto border-t border-border bg-white/60 py-4 px-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} Qarshi davlat universiteti. Barcha huquqlar himoyalangan.
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import {
  Menu,
  RotateCw,
  Calendar,
  Globe,
  ChevronDown,
  Printer,
} from "lucide-react";
import { ReportingPeriod } from "@/features/dashboard/types";
import { REPORTING_PERIOD_OPTIONS } from "@/data/mocks/dashboard.mock";

interface AppHeaderProps {
  onMobileMenuOpen: () => void;
  period: ReportingPeriod;
  onPeriodChange: (period: ReportingPeriod) => void;
  lastUpdated?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AppHeader({
  onMobileMenuOpen,
  period,
  onPeriodChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: AppHeaderProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/95 backdrop-blur-md border-b border-border shadow-subtle transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 sm:px-6 py-2.5 gap-3 max-w-[106rem] mx-auto w-full">
        {/* Left Section: Mobile Toggle & Brand / Title / Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="p-2.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Menyuni ochish"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center">
              <div className="relative w-[84px] h-12 mr-2">
                <Image
                  src="/assets/logo-oz-dark-text.svg"
                  alt="QarshiDU Logotipi"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div>
              {/* Breadcrumbs */}
              <nav aria-label="Sahifa yo'li" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
                <span className="hover:text-slate-700">QarshiDU Statistika</span>
                <span className="text-slate-300">/</span>
                <span className="text-primary font-semibold">Bosh sahifa</span>
              </nav>

              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                Universitet statistikasi

              </h1>
            </div>
          </div>
        </div>

        {/* Right Section: Controls, Period Selector, Print, Refresh, Language */}
        <div className="flex items-center flex-wrap gap-2.5 self-end lg:self-center">
          {/* Last updated indicator (Desktop) */}
          {lastUpdated && (
            <div
              className="hidden xl:flex items-center text-xs text-slate-500 mr-1 py-1 px-2.5 rounded-full bg-slate-50 border border-slate-100"
              title="Ma'lumotlar oxirgi marta yangilangan vaqti"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
              <span>{lastUpdated.replace(/\s*\([^)]*\)/, "")}</span>
            </div>
          )}

          {/* Period Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value as ReportingPeriod)}
              className="appearance-none pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm cursor-pointer transition-colors"
              aria-label="Hisobot davrini tanlash"
            >
              {REPORTING_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Print / Export Report Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary no-print"
            title="Hisobotni chop etish yoki fayl sifatida saqlash"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Chop etish</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center p-2.5 sm:p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-slate-300 shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 no-print"
            title="Ma'lumotlarni yangilash"
            aria-label="Ma'lumotlarni yangilash"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          {/* Language Selector */}
          <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm text-xs font-semibold text-slate-700 gap-1.5 select-none">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>O&apos;zbekcha</span>
          </div>
        </div>
      </div>
    </header>
  );
}

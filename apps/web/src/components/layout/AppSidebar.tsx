"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Users,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Universitet",
    href: "/",
    icon: LayoutDashboard,
    isActive: true,
    shortcut: "1",
  },
  {
    id: "students",
    label: "Bo'limlar",
    href: "#",
    icon: GraduationCap,
    badge: "Tez kunda",
    shortcut: "2",
  },
  {
    id: "faculties",
    label: "Fakultetlar",
    href: "#",
    icon: Building2,
    badge: "Tez kunda",
    shortcut: "3",
  },
  {
    id: "teachers",
    label: "Bitiruvchilar",
    href: "#",
    icon: Users,
    badge: "Tez kunda",
    shortcut: "4",
  },
  {
    id: "research",
    label: "Ilmiy faoliyat",
    href: "#",
    icon: FlaskConical,
    badge: "Tez kunda",
    shortcut: "5",
  },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AppSidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onCollapsedChange,
}: AppSidebarProps) {
  const [internalCollapsed, setIsCollapsed] = useState<boolean>(true);
  const isCollapsed = collapsed ?? internalCollapsed;

  useEffect(() => {
    const savedState = localStorage.getItem("qardu_sidebar_collapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("qardu_sidebar_collapsed", String(next));
    } catch {
      /* storage unavailable */
    }
    onCollapsedChange?.(next);
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        onMobileClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label="Asosiy navigatsiya"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-surface border-r border-border transition-[width,transform] duration-200 ease-in-out shadow-subtle",
          // Desktop collapsed vs expanded
          isCollapsed ? "lg:w-[72px]" : "lg:w-[240px]",
          // Mobile open vs closed
          mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Collapse / expand toggle on the sidebar edge (desktop) */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-[56px] z-50 items-center justify-center w-7 h-7 rounded-full border border-border bg-white text-slate-500 shadow-card hover:text-primary hover:border-primary/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isCollapsed ? "Yon panelni kengaytirish" : "Yon panelni ixchamlashtirish"}
          title={isCollapsed ? "Yon panelni kengaytirish" : "Yon panelni ixchamlashtirish"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-between h-[70px] px-3.5 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200">
              <Image
                src="/assets/logo.png"
                alt="QarshiDU logotipi"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                  QarshiDU Statistika
                </span>
                <span className="text-[11px] text-slate-500 truncate">
                  Ochiq ma&apos;lumotlar
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Menyuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isItemActive = item.isActive;

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (!item.isActive) {
                      e.preventDefault();
                    } else if (mobileOpen) {
                      onMobileClose();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isItemActive
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 cursor-pointer"
                  )}
                  aria-current={isItemActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-150",
                      isItemActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                    )}
                  />

                  {(!isCollapsed || mobileOpen) && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>

                {/* Collapsed Mode Tooltip on Hover */}
                {isCollapsed && !mobileOpen && (
                  <div
                    role="tooltip"
                    className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 text-[10px] text-slate-400">({item.badge})</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / Toggle & University Links */}
        <div className="p-2 border-t border-border flex flex-col gap-1">
          {(!isCollapsed || mobileOpen) && (
            <div className="px-2 py-2 mb-1 rounded-xl bg-slate-50 text-[11px] text-slate-500 flex flex-col gap-1">
              <span className="font-semibold text-slate-700">QarshiDU Axborot xizmati</span>
              <a
                href="https://qardu.uz"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span>qardu.uz</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}


        </div>
      </aside>
    </>
  );
}

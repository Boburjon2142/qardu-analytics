"use client";

import React from "react";
import { MapPin, Navigation, Layers, Compass } from "lucide-react";

export function FacultyMapPlaceholder() {
  return (
    <div className="relative w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card overflow-hidden">
      {/* Background Stylized Map Grid Visual */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-4 max-w-2xl mx-auto">
        {/* Radar / Pin animated indicator */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-primary/10 animate-ping duration-1000" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
            <Navigation className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Fakultetlarning hududiy joylashuvi
        </h3>

        {/* Required Exact Text */}
        <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Fakultetlarning joylashuvi va talabalar statistikasi keyingi bosqichda ko&apos;rsatiladi.
        </p>

        {/* Regional & Campus Metadata badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-primary" />
            Qarshi shahri, Qashqadaryo viloyati
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            12 ta fakultet va o&apos;quv binolari dislokatsiyasi
          </span>
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            Phase 2: Interaktiv GIS xaritasi
          </span>
        </div>
      </div>
    </div>
  );
}

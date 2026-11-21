"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Layers,
  Compass,
  Building,
  GraduationCap,
  Bus,
  CheckCircle2,
} from "lucide-react";

interface CampusCluster {
  id: string;
  name: string;
  address: string;
  facultiesCount: number;
  buildingsCount: number;
  studentCapacity: string;
  transportInfo: string;
  coordinates: string;
}

const CAMPUS_CLUSTERS: CampusCluster[] = [
  {
    id: "main",
    name: "Markaziy kampus (Bosh bino va Tabiiy fanlar)",
    address: "Qarshi shahri, Kuchabog' ko'chasi, 17-uy",
    facultiesCount: 6,
    buildingsCount: 3,
    studentCapacity: "11 500 o'rin",
    transportInfo: "1, 4, 12, 19-yo'nalishli avtobuslar",
    coordinates: "38.8612° N, 65.7847° E",
  },
  {
    id: "it-innovations",
    name: "Yangi shahar kampusi (IT va Iqtisodiyot)",
    address: "Qarshi shahri, Mustaqillik shoh ko'chasi, 8-uy",
    facultiesCount: 3,
    buildingsCount: 2,
    studentCapacity: "6 200 o'rin",
    transportInfo: "5, 8, 14, 22-yo'nalishli jamoat transporti",
    coordinates: "38.8540° N, 65.7990° E",
  },
  {
    id: "dorm-campus",
    name: "Talabalar shaharchasi (TTJ majmualari va ARM)",
    address: "Qarshi shahri, Universitet ko'chasi, 2-uy",
    facultiesCount: 3,
    buildingsCount: 5,
    studentCapacity: "4 320 yotoqxona o'rni",
    transportInfo: "3, 7, 10, 18-yo'nalishli transportlar",
    coordinates: "38.8680° N, 65.7730° E",
  },
];

export function FacultyMapPlaceholder() {
  const [selectedCluster, setSelectedCluster] = useState<string>("main");
  const activeCluster = CAMPUS_CLUSTERS.find((c) => c.id === selectedCluster) || CAMPUS_CLUSTERS[0];

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card overflow-hidden">
      {/* Background Architectural Map Matrix */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#3B5BA9_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-6">
        {/* Animated GPS Radar Pin */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-primary/10 animate-ping duration-1000" />
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
            <Navigation className="w-3 h-3" />
          </div>
        </div>

        {/* Required Exact Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Fakultetlarning hududiy joylashuvi
        </h3>

        {/* Required Exact Text */}
        <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          Fakultetlarning joylashuvi va talabalar statistikasi keyingi bosqichda ko&apos;rsatiladi.
        </p>

        {/* Regional Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-primary" />
            Qarshi shahri, Qashqadaryo viloyati
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            12 ta fakultet va o&apos;quv binolari dislokatsiyasi
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            GIS Arxitekturasi: 2-bosqich
          </span>
        </div>
      </div>

      {/* Interactive Campus Cluster Selector (Preview) */}
      <div className="relative z-10 border-t border-slate-100 pt-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
          Universitet binolari klasterlari (Geolokatsiya ma&apos;lumotlari):
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CAMPUS_CLUSTERS.map((cluster) => {
            const isSelected = cluster.id === selectedCluster;
            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setSelectedCluster(cluster.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20"
                    : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {cluster.name}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-1.5" />
                  )}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{cluster.address}</span>
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Sig&apos;im:</span>
                  <span className="font-bold text-slate-800">{cluster.studentCapacity}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Campus Detail Preview Bar */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">{activeCluster.name}</span>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                GPS: {activeCluster.coordinates} • {activeCluster.buildingsCount} ta korpus • {activeCluster.facultiesCount} ta fakultet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <Bus className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeCluster.transportInfo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

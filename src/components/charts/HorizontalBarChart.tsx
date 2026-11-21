"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowUpDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CustomTooltip } from "./CustomTooltip";
import { formatNumber } from "@/lib/formatters";

export interface HorizontalBarItem {
  id?: string;
  name: string;
  count: number;
  secondaryCount?: number;
  percentage?: number;
  color?: string;
  dscCount?: number;
  phdCount?: number;
}

export interface HorizontalBarChartProps<T extends HorizontalBarItem = HorizontalBarItem> {
  data: T[];
  unit?: string;
  barColor?: string;
  allowSorting?: boolean;
  minHeight?: number;
}

export function HorizontalBarChart<T extends HorizontalBarItem = HorizontalBarItem>({
  data,
  unit = "nafar",
  barColor = "#5B5FA8",
  allowSorting = true,
  minHeight = 460,
}: HorizontalBarChartProps<T>) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "dsc" | "default">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    const copy = [...filteredData];
    if (sortOrder === "desc") {
      return copy.sort((a, b) => b.count - a.count);
    }
    if (sortOrder === "asc") {
      return copy.sort((a, b) => a.count - b.count);
    }
    if (sortOrder === "dsc") {
      return copy.sort((a, b) => (b.dscCount ?? 0) - (a.dscCount ?? 0));
    }
    return copy;
  }, [filteredData, sortOrder]);

  const chartData = sortedData.map((item) => ({
    ...item,
    value: item.count,
    unit,
  }));

  const cycleSort = () => {
    if (sortOrder === "desc") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("dsc");
    else if (sortOrder === "dsc") setSortOrder("default");
    else setSortOrder("desc");
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  const dynamicHeight = Math.max(minHeight, chartData.length * 38);

  return (
    <div className="w-full flex flex-col">
      {/* Search and Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3 pb-3 border-b border-slate-100">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fakultet nomi bo'yicha qidirish..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        {/* Sorting Control */}
        {allowSorting && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Saralash:
            </span>
            <button
              type="button"
              onClick={cycleSort}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors border border-slate-200/60"
              title="Saralash tartibi"
            >
              {sortOrder === "desc" && (
                <>
                  <ArrowDownWideNarrow className="w-3.5 h-3.5 text-primary" />
                  <span>Jami o&apos;qituvchilar (kamayish)</span>
                </>
              )}
              {sortOrder === "asc" && (
                <>
                  <ArrowUpNarrowWide className="w-3.5 h-3.5 text-primary" />
                  <span>Jami o&apos;qituvchilar (o&apos;sish)</span>
                </>
              )}
              {sortOrder === "dsc" && (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DSc ilmiy darajalilar bo&apos;yicha</span>
                </>
              )}
              {sortOrder === "default" && (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Birlamchi ro&apos;yxat</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          &ldquo;{searchQuery}&rdquo; so&apos;rovi bo&apos;yicha fakultet topilmadi.
        </div>
      ) : (
        /* Horizontal Bar Chart Canvas */
        <div className="w-full" style={{ height: dynamicHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#E2E8F0"
                opacity={0.8}
              />
              <XAxis
                type="number"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
                tickFormatter={(val) => formatNumber(val)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#1E293B", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={190}
                interval={0}
              />
              <Tooltip content={<CustomTooltip defaultUnit={unit} />} />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                barSize={20}
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`hbar-cell-${entry.id || index}`}
                    fill={entry.color || barColor}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

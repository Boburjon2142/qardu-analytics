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
import { ArrowUpDown, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
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
  barColor = "#4F46E5",
  allowSorting = true,
  minHeight = 440,
}: HorizontalBarChartProps<T>) {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "default">("desc");

  const sortedData = useMemo(() => {
    if (!data) return [];
    const copy = [...data];
    if (sortOrder === "desc") {
      return copy.sort((a, b) => b.count - a.count);
    }
    if (sortOrder === "asc") {
      return copy.sort((a, b) => a.count - b.count);
    }
    return copy;
  }, [data, sortOrder]);

  const chartData = sortedData.map((item) => ({
    ...item,
    value: item.count,
    unit,
  }));

  const cycleSort = () => {
    if (sortOrder === "desc") setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("default");
    else setSortOrder("desc");
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  // Dynamic height based on number of items so full faculty names have breathing room
  const dynamicHeight = Math.max(minHeight, data.length * 36);

  return (
    <div className="w-full flex flex-col">
      {/* Sorting Control */}
      {allowSorting && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={cycleSort}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Saralash tartibi"
          >
            {sortOrder === "desc" && (
              <>
                <ArrowDownWideNarrow className="w-3.5 h-3.5 text-primary" />
                <span>Kamayish bo&apos;yicha</span>
              </>
            )}
            {sortOrder === "asc" && (
              <>
                <ArrowUpNarrowWide className="w-3.5 h-3.5 text-primary" />
                <span>O&apos;sish bo&apos;yicha</span>
              </>
            )}
            {sortOrder === "default" && (
              <>
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Birlamchi tartib</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bar Chart Container */}
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
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={180}
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
    </div>
  );
}

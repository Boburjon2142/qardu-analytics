"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { formatNumber, formatPercentage } from "@/lib/formatters";

export interface DoughnutSegment {
  id?: string;
  name: string;
  count: number;
  percentage?: number;
  color?: string;
}

export interface DoughnutChartProps<T extends DoughnutSegment = DoughnutSegment> {
  data: T[];
  centerValue?: string | number;
  centerLabel?: string;
  unit?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
}

const DEFAULT_PALETTE = [
  "#2563EB", // Primary Blue
  "#4F46E5", // Deep Indigo
  "#06B6D4", // Accent Cyan
  "#10B981", // Success Green
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo light
  "#3B82F6", // Blue light
  "#0EA5E9", // Sky
];

export function DoughnutChart<T extends DoughnutSegment = DoughnutSegment>({
  data,
  centerValue,
  centerLabel = "Jami",
  unit = "nafar",
  height = 260,
  colors = DEFAULT_PALETTE,
  showLegend = true,
}: DoughnutChartProps<T>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  // Pre-calculate sum for center if not explicitly provided
  const totalSum = data.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const displayCenterValue =
    centerValue !== undefined
      ? typeof centerValue === "number"
        ? formatNumber(centerValue)
        : centerValue
      : formatNumber(totalSum);

  const chartData = data.map((item, idx) => ({
    ...item,
    value: item.count,
    color: item.color || colors[idx % colors.length],
    unit,
  }));

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      {/* Chart Canvas with Center Text Overlay */}
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<CustomTooltip defaultUnit={unit} />}
              cursor={{ fill: "transparent" }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="88%"
              paddingAngle={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={600}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id || index}`}
                  fill={entry.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  className="transition-all duration-200 cursor-pointer"
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label & number inside doughnut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {centerLabel}
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {displayCenterValue}
          </span>
          {unit && typeof centerValue !== "string" && (
            <span className="text-[10px] text-slate-400 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Legend */}
      {showLegend && (
        <div className="w-full mt-3 pt-3 border-t border-slate-100 max-h-[120px] overflow-y-auto space-y-1.5 pr-1">
          {chartData.map((item, idx) => (
            <div
              key={`legend-${item.id || idx}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between text-xs py-0.5 px-1.5 rounded-lg transition-colors cursor-pointer ${
                activeIndex === idx ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 truncate font-medium" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-900">
                  {formatNumber(item.count)}
                </span>
                {typeof item.percentage === "number" && (
                  <span className="text-[11px] font-medium text-slate-400 min-w-[38px] text-right">
                    {formatPercentage(item.percentage)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

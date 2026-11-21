"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
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
  /** "stacked": legend below the ring. "side": legend beside the ring on md+ screens. */
  layout?: "stacked" | "side";
}

const DEFAULT_PALETTE = [
  "#3B5BA9", // Primary Blue
  "#5B5FA8", // Deep Indigo
  "#4A9BB0", // Accent Cyan
  "#4E9A83", // Success Green
  "#C9954A", // Amber
  "#B8648A", // Pink
  "#7C6BB0", // Purple
  "#4A9C98", // Teal
  "#C27A4E", // Orange
  "#6E73B5", // Indigo light
  "#5F86C2", // Blue light
  "#5A9CC0", // Sky
];

export function DoughnutChart<T extends DoughnutSegment = DoughnutSegment>({
  data,
  centerValue,
  centerLabel = "Jami",
  unit = "nafar",
  height = 260,
  colors = DEFAULT_PALETTE,
  showLegend = true,
  layout = "stacked",
}: DoughnutChartProps<T>) {
  const side = layout === "side";
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

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;
  const activeShare = activeItem
    ? typeof activeItem.percentage === "number"
      ? activeItem.percentage
      : totalSum > 0
        ? Number(((activeItem.count / totalSum) * 100).toFixed(1))
        : null
    : null;

  return (
    <div
      className={
        side
          ? "flex flex-col md:flex-row md:items-center gap-5 w-full flex-1"
          : "flex flex-col items-center justify-start w-full"
      }
    >
      {/* Chart Canvas with Center Text Overlay */}
      <div
        className={side ? "relative w-full md:w-[var(--d)] md:shrink-0" : "relative w-full"}
        style={{ height, ["--d" as string]: `${height}px` }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="56%"
              outerRadius="94%"
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

        {/* Center label: shows overall total, or the hovered segment */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center text-center w-[96px]">
            {activeItem ? (
              <>
                <span
                  className="text-[10px] font-medium text-slate-500 leading-[1.15] line-clamp-3 break-words [text-wrap:balance]"
                  title={activeItem.name}
                >
                  {activeItem.name}
                </span>
                <span className="mt-0.5 text-lg font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {formatNumber(activeItem.count)}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                  {activeShare !== null ? formatPercentage(activeShare) : unit}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-normal leading-tight">
                  {centerLabel}
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
                  {displayCenterValue}
                </span>
                {unit && typeof centerValue !== "string" && (
                  <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      {showLegend && (
        <div
          className={
            side
              ? `flex-1 min-w-0 w-full md:border-l md:border-slate-100 md:pl-5 ${
                chartData.length > 6
                  ? "space-y-0.5 md:space-y-0 md:columns-2 min-[1700px]:columns-3 md:gap-x-8"
                  : "space-y-0.5"
              }`
              : "w-full mt-4 pt-3 border-t border-slate-100 max-h-[170px] overflow-y-auto space-y-1 pr-1"
          }
          style={
            !side && chartData.length > 6
              ? {
                  maskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 82%, transparent 100%)",
                }
              : undefined
          }
        >
          {chartData.map((item, idx) => (
            <div
              key={`legend-${item.id || idx}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between text-xs py-1 px-1.5 rounded-lg break-inside-avoid transition-colors cursor-pointer ${
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

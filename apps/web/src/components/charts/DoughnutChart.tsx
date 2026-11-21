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
  /** "presentation": text scales with the ring and the legend is never clipped. */
  variant?: "default" | "presentation";
}

const DEFAULT_PALETTE = [
  "#3E5BA1", // Primary Blue
  "#5C61A2", // Deep Indigo
  "#5099AC", // Accent Cyan
  "#539883", // Success Green
  "#C59752", // Amber
  "#B56989", // Pink
  "#7D6EAC", // Purple
  "#509A95", // Teal
  "#BE7C52", // Orange
  "#7075B0", // Indigo light
  "#6387BC", // Blue light
  "#609ABA", // Sky
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
  variant = "default",
}: DoughnutChartProps<T>) {
  const side = layout === "side";
  const big = variant === "presentation";
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const centerWidth = big ? Math.round(height * 0.5) : 96;
  const valueSize = clamp(Math.round(height * 0.1), 22, 60);
  const labelSize = clamp(Math.round(height * 0.03), 11, 17);
  const legendSize = clamp(Math.round(height * 0.04), 14, 17);
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
          ? `flex flex-col md:flex-row md:items-center gap-5 w-full flex-1 ${big ? "md:justify-center md:gap-16" : ""}`
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
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ width: centerWidth }}
          >
            {activeItem ? (
              <>
                <span
                  className="text-[10px] font-medium text-slate-500 leading-[1.15] line-clamp-3 break-words [text-wrap:balance]"
                  style={big ? { fontSize: labelSize, lineHeight: 1.2 } : undefined}
                  title={activeItem.name}
                >
                  {activeItem.name}
                </span>
                <span
                  className="mt-0.5 text-lg font-extrabold text-slate-900 tracking-tight tabular-nums"
                  style={big ? { fontSize: valueSize, lineHeight: 1.1 } : undefined}
                >
                  {formatNumber(activeItem.count)}
                </span>
                <span
                  className="text-[10px] font-semibold text-slate-500 tabular-nums"
                  style={big ? { fontSize: labelSize, lineHeight: 1.2 } : undefined}
                >
                  {activeShare !== null ? formatPercentage(activeShare) : unit}
                </span>
              </>
            ) : (
              <>
                <span
                  className="text-[9px] font-medium text-slate-500 uppercase tracking-normal leading-tight"
                  style={big ? { fontSize: labelSize, lineHeight: 1.2 } : undefined}
                >
                  {centerLabel}
                </span>
                <span
                  className="text-xl font-black text-slate-900 tracking-tight tabular-nums"
                  style={big ? { fontSize: valueSize, lineHeight: 1.1 } : undefined}
                >
                  {displayCenterValue}
                </span>
                {unit && typeof centerValue !== "string" && (
                  <span
                    className="text-[10px] text-slate-400 font-medium"
                    style={big ? { fontSize: labelSize, lineHeight: 1.2 } : undefined}
                  >
                    {unit}
                  </span>
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
              ? `min-w-0 w-full md:border-l md:border-slate-100 md:pl-5 ${
                big ? "md:w-[38rem] md:flex-none" : "flex-1"
              } ${
                chartData.length > 6
                  ? `space-y-0.5 md:space-y-0 md:gap-x-8 ${big ? "md:columns-[24rem]" : "md:columns-[17rem]"}`
                  : "space-y-0.5"
              }`
              : `w-full mt-4 pt-3 border-t border-slate-100 space-y-1 pr-1 ${
                  big ? "" : "max-h-[170px] overflow-y-auto"
                }`
          }
          style={
            !side && !big && chartData.length > 6
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
              style={
                big ? { fontSize: legendSize, paddingBlock: Math.round(legendSize * 0.3) } : undefined
              }
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: item.color,
                    ...(big ? { width: legendSize * 0.7, height: legendSize * 0.7 } : {}),
                  }}
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
                  <span
                    className="text-[11px] font-medium text-slate-400 min-w-[38px] text-right"
                    style={big ? { fontSize: legendSize - 2, minWidth: legendSize * 3 } : undefined}
                  >
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

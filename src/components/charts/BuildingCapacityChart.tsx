"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { useIsNarrow } from "./useIsNarrow";
import { BuildingCapacityData } from "@/features/dashboard/types";
import { formatNumber } from "@/lib/formatters";

export interface BuildingCapacityChartProps {
  data: BuildingCapacityData[];
  unit?: string;
  height?: number;
}

export function BuildingCapacityChart({
  data,
  unit = "o'rin",
  height = 300,
}: BuildingCapacityChartProps) {
  const narrow = useIsNarrow();
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    type: item.type,
    "Loyiha sig'imi": item.capacity,
    "Haqiqiy bandlik": item.occupancy,
    capacity: item.capacity,
    occupancy: item.occupancy,
    unit,
  }));

  return (
    <div className="w-full flex flex-col" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
            opacity={0.8}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            interval={0}
            dy={8}
            {...(narrow ? { angle: -40, textAnchor: "end" as const, height: 64 } : {})}
            tickFormatter={(val: string) => {
              if (val.length > 16) {
                return `${val.substring(0, 14)}…`;
              }
              return val;
            }}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => formatNumber(val)}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip defaultUnit={unit} />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
          />
          <Bar
            dataKey="Loyiha sig'imi"
            fill="#5B5FA8" // Deep Indigo
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="Haqiqiy bandlik"
            fill="#4A9BB0" // Accent Cyan
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

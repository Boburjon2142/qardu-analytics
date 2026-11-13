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
import { DormitoryCapacityItem } from "@/features/dashboard/types";
import { formatNumber } from "@/lib/formatters";

export interface StackedBarChartProps {
  data: DormitoryCapacityItem[];
  unit?: string;
  height?: number;
}

export function StackedBarChart({
  data,
  unit = "o'rin",
  height = 300,
}: StackedBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name.replace("Talabalar turar joyi", "TTJ"),
    fullName: item.name,
    totalCapacity: item.totalCapacity,
    "Band o'rinlar": item.occupiedSpots,
    "Bo'sh o'rinlar": item.vacantSpots,
    occupiedSpots: item.occupiedSpots,
    vacantSpots: item.vacantSpots,
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
            dataKey="Band o'rinlar"
            stackId="dorm"
            fill="#2563EB" // Primary Blue
            radius={[0, 0, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey="Bo'sh o'rinlar"
            stackId="dorm"
            fill="#10B981" // Success Green
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

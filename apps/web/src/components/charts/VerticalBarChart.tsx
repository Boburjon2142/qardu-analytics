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
  Cell,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export interface VerticalBarItem {
  id?: string;
  name: string;
  count: number;
  percentage?: number;
  color?: string;
}

export interface VerticalBarChartProps<T extends VerticalBarItem = VerticalBarItem> {
  data: T[];
  unit?: string;
  height?: number;
  barColor?: string;
  showGrid?: boolean;
}

export function VerticalBarChart<T extends VerticalBarItem = VerticalBarItem>({
  data,
  unit = "nafar",
  height = 280,
  barColor = "#3B5BA9",
  showGrid = true,
}: VerticalBarChartProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-xs text-slate-400">
        Ma&apos;lumot mavjud emas
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    value: item.count,
    unit,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 10, left: -10, bottom: 25 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
              opacity={0.8}
            />
          )}
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
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip defaultUnit={unit} />} />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`bar-cell-${entry.id || index}`}
                fill={entry.color || barColor}
                className="hover:opacity-85 transition-opacity cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import React from "react";
import { formatNumber, formatPercentage } from "@/lib/formatters";

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: {
      name?: string;
      category?: string;
      count?: number;
      value?: number;
      percentage?: number;
      unit?: string;
      total?: number;
      occupiedSpots?: number;
      vacantSpots?: number;
      totalCapacity?: number;
      type?: string;
      capacity?: number;
      occupancy?: number;
      dscCount?: number;
      phdCount?: number;
      teacherCount?: number;
    };
  }>;
  label?: string;
  defaultUnit?: string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  defaultUnit = "nafar",
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const firstItem = payload[0];
  const itemData = firstItem.payload || {};
  const itemName = label || itemData.name || itemData.category || firstItem.name;
  const unit = itemData.unit || defaultUnit;

  return (
    <div className="z-50 min-w-[180px] rounded-xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs chart-tooltip-enter">
      {/* Header / Title */}
      <div className="font-semibold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 flex items-center justify-between gap-2">
        <span className="truncate max-w-[200px]" title={itemName}>
          {itemName}
        </span>
        {itemData.type && (
          <span className="text-[10px] text-slate-500 font-normal px-1.5 py-0.5 rounded bg-slate-100">
            {itemData.type}
          </span>
        )}
      </div>

      {/* Multi-series payload (e.g. Stacked Bars) */}
      {payload.length > 1 ? (
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-900">
                {formatNumber(entry.value)} {unit}
              </span>
            </div>
          ))}
          {itemData.totalCapacity && (
            <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-slate-500">
              <span>Umumiy sig&apos;im:</span>
              <span className="font-semibold text-slate-700">
                {formatNumber(itemData.totalCapacity)} {unit}
              </span>
            </div>
          )}
          {itemData.capacity && itemData.occupancy && (
            <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-slate-500">
              <span>Bandlik darajasi:</span>
              <span className="font-semibold text-emerald-600">
                {((itemData.occupancy / itemData.capacity) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Single Series payload */
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: firstItem.color || "#425B94" }}
              />
              Miqdor:
            </span>
            <span className="font-bold text-slate-900">
              {formatNumber(firstItem.value ?? itemData.count ?? itemData.value)} {unit}
            </span>
          </div>

          {typeof itemData.percentage === "number" && (
            <div className="flex items-center justify-between gap-3 text-slate-500 pt-0.5">
              <span>Ulushi:</span>
              <span className="font-semibold text-primary">
                {formatPercentage(itemData.percentage)}
              </span>
            </div>
          )}

          {/* Teacher academic stats if present */}
          {typeof itemData.dscCount === "number" && typeof itemData.phdCount === "number" && (
            <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Fan doktori:</span>
                <span className="font-semibold text-emerald-600">{itemData.dscCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Falsafa doktori:</span>
                <span className="font-semibold text-primary">{itemData.phdCount}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

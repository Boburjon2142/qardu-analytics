import React from "react";

interface WrappedTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  /** Maximum characters per line before wrapping. */
  maxChars?: number;
  /** Maximum number of lines; the last line is truncated with an ellipsis. */
  maxLines?: number;
}

/** Splits text into lines on word boundaries (long single words are kept whole). */
export function wrapLabel(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, Math.max(1, maxChars - 1))}…`;
    return kept;
  }
  return lines;
}

/** Recharts XAxis tick that wraps long category names onto several lines. */
export function WrappedTick({
  x = 0,
  y = 0,
  payload,
  maxChars = 14,
  maxLines = 3,
}: WrappedTickProps) {
  const full = payload?.value ?? "";
  const lines = wrapLabel(full, maxChars, maxLines);
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{full}</title>
      <text textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={500}>
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 14 : 13}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

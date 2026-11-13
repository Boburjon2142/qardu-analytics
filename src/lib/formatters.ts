/**
 * Uzbek locale number formatter with standard spaces for thousands.
 * Uses Intl.NumberFormat('uz-UZ') formatToParts to guarantee consistent typography across all browsers.
 */
const uzNumberFormatter = new Intl.NumberFormat("uz-UZ", {
  maximumFractionDigits: 1,
});

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0";
  }

  try {
    const parts = uzNumberFormatter.formatToParts(value);
    return parts.map((p) => (p.type === "group" ? " " : p.value)).join("");
  } catch {
    return uzNumberFormatter.format(value).replace(/,/g, " ");
  }
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0%";
  }
  return `${Number(value.toFixed(1))}%`;
}

export function formatCurrencyUZS(value: number): string {
  return `${formatNumber(value)} so'm`;
}

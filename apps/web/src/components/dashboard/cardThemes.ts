/**
 * Soft section themes for chart cards: a lighter version of the KPI card look
 * (tinted gradient, accent top bar, tinted border and unit chip).
 * Text colors keep >= 4.5:1 contrast on the tinted backgrounds.
 */
export type CardAccent = "blue" | "green" | "indigo";

export interface CardTheme {
  /** Gradient background + tinted border + accent top bar. */
  surface: string;
  /** Unit chip next to the title. */
  chip: string;
  /** Shadow tint on hover. */
  hover: string;
}

export const CARD_THEMES: Record<CardAccent, CardTheme> = {
  blue: {
    surface:
      "border-[#D5E0F4] border-t-[3px] border-t-primary bg-gradient-to-br from-[#E6EEFB] via-[#F4F7FD] to-white",
    chip: "bg-white/80 text-[#3E5BA1] ring-1 ring-[#D5E0F4]",
    hover: "hover:shadow-blue-500/10",
  },
  green: {
    surface:
      "border-[#CBE5DA] border-t-[3px] border-t-[#539883] bg-gradient-to-br from-[#DDF0E7] via-[#F1F8F5] to-white",
    chip: "bg-white/80 text-[#2F7561] ring-1 ring-[#CBE5DA]",
    hover: "hover:shadow-emerald-500/10",
  },
  indigo: {
    surface:
      "border-[#D8DAF0] border-t-[3px] border-t-[#5C61A2] bg-gradient-to-br from-[#E6E7F7] via-[#F4F4FB] to-white",
    chip: "bg-white/80 text-[#4B5090] ring-1 ring-[#D8DAF0]",
    hover: "hover:shadow-indigo-500/10",
  },
};

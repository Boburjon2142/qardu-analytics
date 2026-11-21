import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#EFF3F9",
          100: "#DFE7F2",
          200: "#C8D5E8",
          500: "#6A88B3",
          600: "#425B94",
          700: "#34487A",
        },
        indigo: {
          DEFAULT: "#5B5FA8",
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#7377A8",
          600: "#5B5FA8",
          700: "#4C5086",
        },
        cyan: {
          DEFAULT: "#4A9BB0",
          50: "#ECFEFF",
          100: "#CFFAFE",
          500: "#4A9BB0",
          600: "#3F8497",
        },
        success: {
          DEFAULT: "#4E9A83",
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#4E9A83",
          600: "#2F7561",
        },
        // Calm replacements for Tailwind's default saturated scales (text shades keep AA contrast on white).
        emerald: {
          50: "#EEF5F2", 100: "#DCEBE5", 200: "#C4DBD2", 300: "#A5C6BA",
          500: "#5A9684", 600: "#2F7561", 700: "#285F4F",
        },
        blue: {
          50: "#EFF3F9", 100: "#DFE7F2", 200: "#C8D5E8", 300: "#A8BBD8",
          500: "#6A88B3", 600: "#425B94", 700: "#34487A",
        },
        red: {
          50: "#F9EFF0", 100: "#F1DDE0", 500: "#B06470", 600: "#A44B58",
        },
        canvas: "#F7F9FC",
        surface: "#FFFFFF",
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        card: "0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        cardHover: "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

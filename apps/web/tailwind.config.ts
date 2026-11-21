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
          600: "#3E5BA1",
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
        // Softened (not neon) replacements for Tailwind's saturated scales; text shades keep AA contrast.
        emerald: {
          50: "#EDF8F3",
          100: "#D8F1E5",
          200: "#B8E5D1",
          300: "#8FD3B9",
          500: "#3CA483",
          600: "#1E8264",
          700: "#1A6952",
        },
        blue: {
          50: "#EFF4FB",
          100: "#DDE8F7",
          200: "#C4D7F1",
          300: "#A0BFE7",
          500: "#5786CE",
          600: "#365EB7",
          700: "#2B4AA0",
        },
        red: {
          50: "#FBF0F1",
          100: "#F6DFE1",
          500: "#C9575E",
          600: "#BA3C44",
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

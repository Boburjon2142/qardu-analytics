import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QarshiDU Statistika — Qarshi davlat universitetining statistik-tahliliy portali",
  description:
    "Qarshi davlat universitetining ochiq statistik-analitik ko'rsatkichlari, talabalar kontingenti, professor-o'qituvchilar salohiyati va infratuzilma monitoringi.",
  keywords: [
    "QarshiDU",
    "QarDU",
    "Qarshi davlat universiteti",
    "Statistika",
    "Tahlil",
    "Talabalar",
    "Oliy ta'lim",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={inter.variable}>
      <body className="min-h-screen font-sans bg-canvas text-slate-900 antialiased selection:bg-primary/20 selection:text-primary">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

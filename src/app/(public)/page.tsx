"use client";

import React from "react";
import {
  GraduationCap,
  Building2,
  Users,
  PieChart,
  BarChart3,
  Building,
  FlaskConical,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DoughnutChart } from "@/components/charts/DoughnutChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { BuildingCapacityChart } from "@/components/charts/BuildingCapacityChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { FacultyMapPlaceholder } from "@/components/dashboard/FacultyMapPlaceholder";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { formatNumber, formatPercentage } from "@/lib/formatters";

export default function DashboardPage() {
  const {
    period,
    setPeriod,
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useDashboardData("2024-2025");

  // Safe fallback data while loading or in error state
  const kpi = data?.kpi;
  const students = data?.students;
  const infrastructure = data?.infrastructure;
  const teachersAndResearch = data?.teachersAndResearch;

  // Center display for dormitory supply
  const dormSupplyData = students?.dormitorySupply
    ? [
        {
          id: "provided",
          name: "Ta'minlangan",
          count: students.dormitorySupply.providedCount,
          percentage: students.dormitorySupply.providedRate,
          color: "#10B981",
        },
        {
          id: "unprovided",
          name: "Ta'minlanmagan",
          count: students.dormitorySupply.unprovidedCount,
          percentage: Number(
            (100 - students.dormitorySupply.providedRate).toFixed(1)
          ),
          color: "#F43F5E",
        },
      ]
    : [];

  return (
    <DashboardLayout
      period={period}
      onPeriodChange={setPeriod}
      lastUpdated={kpi?.lastUpdated}
      isRefreshing={isRefetching}
      onRefresh={refetch}
    >
      <div className="space-y-8 pb-12">
        {/* Mock Data Banner Notice */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs sm:text-sm">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 leading-snug">
            <span className="font-bold">Statistik ma&apos;lumotlar (Namuna / Test rejimi):</span>{" "}
            Ushbu ko&apos;rsatkichlar QarDU Analytics 1-bosqich frontend interfeysi uchun mock-data asosida taqdim etilmoqda. Kelgusi bosqichda Django REST API orqali real ma&apos;lumotlar bazasiga ulanadi.
          </div>
          <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-blue-200/60 text-blue-800 font-semibold text-[11px]">
            Design Baseline v1.0
          </span>
        </div>

        {/* 7.1. KPI CARDS */}
        <section aria-label="Asosiy ko'rsatkichlar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Talabalar"
              value={kpi?.totalStudents ?? 0}
              subtitle="Bakalavriat, magistratura va doktorantura talabalari"
              icon={GraduationCap}
              accentColor="blue"
              badgeText="Faol talabalar"
              trendText="+7.4% o'sish"
              subMetrics={[
                { label: "Bakalavr", value: "22 200" },
                { label: "Magistr", value: "2 050" },
                { label: "Doktorant", value: "250" },
              ]}
              isLoading={isLoading}
            />
            <StatCard
              title="Fakultetlar"
              value={kpi?.totalFaculties ?? 0}
              subtitle="Universitetning barcha faoliyat yuritayotgan fakultetlari"
              icon={Building2}
              accentColor="green"
              badgeText="12 ta fakultet"
              trendText="100% akkreditatsiya"
              subMetrics={[
                { label: "Kafedralar", value: "54 ta" },
                { label: "Yo'nalishlar", value: "68 ta" },
                { label: "Mutaxassislik", value: "32 ta" },
              ]}
              isLoading={isLoading}
            />
            <StatCard
              title="O'qituvchilar"
              value={kpi?.totalTeachers ?? 0}
              subtitle="Asosiy ish joyi QarDU bo'lgan professor-o'qituvchilar"
              icon={Users}
              accentColor="indigo"
              badgeText="Asosiy shtat"
              trendText="Ilmiy salohiyat: 44%"
              subMetrics={[
                { label: "DSc (Fan doktori)", value: "85 nafar" },
                { label: "PhD (Falsafa doktori)", value: "465 nafar" },
                { label: "Professor/Dotsent", value: "420 nafar" },
              ]}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* 7.2. TALABALAR — 3 TA DOUGHNUT CHART */}
        <DashboardSection
          title="Talabalar kontingenti tuzilishi"
          subtitle="Fakultetlar, ta'lim darajalari va yotoqxona ta'minoti bo'yicha taqsimot"
          icon={PieChart}
          badge="Doughnut tahlil"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Talabalar fakultetlar kesimida */}
            <ChartCard
              title="Talabalar soni fakultetlar kesimida"
              subtitle="12 ta fakultet bo'yicha segmentlar taqsimoti"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={students?.byFaculty ?? []}
                centerLabel="Jami talaba"
                centerValue={kpi?.totalStudents}
                unit="nafar"
                height={250}
              />
            </ChartCard>

            {/* Chart 2: Talabalar ta'lim darajasi kesimida */}
            <ChartCard
              title="Talabalar soni ta'lim darajasi kesimida"
              subtitle="Bakalavriat, magistratura va doktorantura"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={students?.byLevel ?? []}
                centerLabel="Jami talaba"
                centerValue={kpi?.totalStudents}
                unit="nafar"
                height={250}
              />
            </ChartCard>

            {/* Chart 3: Yotoqxona bilan ta'minlanganlik */}
            <ChartCard
              title="Yotoqxona bilan ta'minlanganlik"
              subtitle="Talabalar turar joyiga ehtiyojmandlar kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={dormSupplyData}
                centerLabel="Ta'minlanganlik"
                centerValue={formatPercentage(students?.dormitorySupply?.providedRate)}
                unit="nafar"
                height={250}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.3. TALABALAR — BAR CHARTS */}
        <DashboardSection
          title="Ta'lim shakllari va kurslar tahlili"
          subtitle="Talabalarning o'qish shakli va bosqichlari bo'yicha soni"
          icon={BarChart3}
          badge="Ustunli diagrammalar"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 4: Ta'lim turi kesimida */}
            <ChartCard
              title="Ta'lim turi kesimida"
              subtitle="Kunduzgi, sirtqi, kechki va masofaviy shakllar"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byType ?? []}
                unit="nafar"
                barColor="#2563EB"
                height={280}
              />
            </ChartCard>

            {/* Chart 5: Kurslar kesimida */}
            <ChartCard
              title="Kurslar kesimida"
              subtitle="1-kursdan bitiruvchi yuqori kurslargacha"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byCourse ?? []}
                unit="nafar"
                barColor="#4F46E5"
                height={280}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.4. INFRATUZILMA */}
        <DashboardSection
          title="Infratuzilma va moddiy-texnik baza"
          subtitle="O'quv binolari sig'imi va talabalar turar joylari monitoringi"
          icon={Building}
          badge="Sig'im va bandlik"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 6: Universitet binolari va sig'imi */}
            <ChartCard
              title="Universitet binolari va sig'imi"
              subtitle="O'quv va laboratoriya korpuslarining loyiha sig'imi hamda bandligi"
              unit="o'rin"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <BuildingCapacityChart
                data={infrastructure?.buildings ?? []}
                unit="o'rin"
                height={300}
              />
            </ChartCard>

            {/* Chart 7: Yotoqxona sig'imi */}
            <ChartCard
              title="Yotoqxona sig'imi (Band va bo'sh o'rinlar)"
              subtitle="Talabalar turar joylarida mavjud o'rinlar taqsimoti"
              unit="o'rin"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <StackedBarChart
                data={infrastructure?.dormitories ?? []}
                unit="o'rin"
                height={300}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.5. O'QITUVCHILAR VA ILMIY FAOLIYAT */}
        <DashboardSection
          title="O'qituvchilar va ilmiy salohiyat"
          subtitle="Ilmiy unvonlar, ilmiy darajalar va xalqaro indekslangan nashrlar"
          icon={FlaskConical}
          badge="Ilmiy faoliyat"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 8: Ilmiy unvonlar */}
            <ChartCard
              title="Ilmiy unvonlar"
              subtitle="Professor, dotsent va katta ilmiy xodimlar"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={teachersAndResearch?.byTitle ?? []}
                centerLabel="Jami o'qituvchi"
                centerValue={kpi?.totalTeachers}
                unit="nafar"
                height={250}
              />
            </ChartCard>

            {/* Chart 9: Ilmiy darajalar */}
            <ChartCard
              title="Ilmiy darajalar"
              subtitle="DSc (Fan doktori) va PhD (Falsafa doktori)"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={teachersAndResearch?.byDegree ?? []}
                centerLabel="Jami o'qituvchi"
                centerValue={kpi?.totalTeachers}
                unit="nafar"
                height={250}
              />
            </ChartCard>

            {/* Chart 10: Ilmiy nashrlar */}
            <ChartCard
              title="Ilmiy nashrlar"
              subtitle="Q1, Scopus va nufuzli ilmiy nashrlar (noyob)"
              unit="ta"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={
                  teachersAndResearch?.publications.map((item) => ({
                    ...item,
                    name: item.category,
                  })) ?? []
                }
                centerLabel="Jami nashrlar"
                centerValue={teachersAndResearch?.publications.reduce(
                  (acc, curr) => acc + curr.count,
                  0
                )}
                unit="ta"
                height={250}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.6. O'QITUVCHILAR FAKULTETLAR KESIMIDA */}
        <DashboardSection
          title="O'qituvchilar fakultetlar kesimida"
          subtitle="12 ta fakultet bo'yicha professor-o'qituvchilar soni va saralash"
          icon={Users}
          badge="Fakultet taqsimoti"
        >
          <ChartCard
            title="O'qituvchilar soni fakultetlar bo'yicha"
            subtitle="To'liq fakultet nomlari va o'qituvchilar soni (saralash mumkin)"
            unit="nafar"
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
          >
            <HorizontalBarChart
              data={
                teachersAndResearch?.byFaculty.map((item) => ({
                  id: item.id,
                  name: item.facultyName,
                  count: item.teacherCount,
                  dscCount: item.dscCount,
                  phdCount: item.phdCount,
                })) ?? []
              }
              unit="nafar"
              barColor="#4F46E5"
              allowSorting={true}
              minHeight={450}
            />
          </ChartCard>
        </DashboardSection>

        {/* 7.7. MAP PLACEHOLDER */}
        <DashboardSection
          title="Hududiy infratuzilma"
          subtitle="Universitet bino va inshootlari geografik joylashuvi"
          icon={MapPin}
          badge="GIS Reja"
        >
          <FacultyMapPlaceholder />
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}

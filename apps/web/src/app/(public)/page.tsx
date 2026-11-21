"use client";

import React from "react";
import {
  GraduationCap,
  Building2,
  Users,
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
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { formatPercentage } from "@/lib/formatters";

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
          color: "#5A9684",
        },
        {
          id: "unprovided",
          name: "Ta'minlanmagan",
          count: students.dormitorySupply.unprovidedCount,
          percentage: Number(
            (100 - students.dormitorySupply.providedRate).toFixed(1)
          ),
          color: "#B06470",
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
      <div className="space-y-4 pb-6">
        {/* 7.1. KPI CARDS */}
        <section aria-label="Asosiy ko'rsatkichlar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              title="Talabalar"
              unit="nafar"
              value={kpi?.totalStudents ?? 0}
              icon={GraduationCap}
              accentColor="blue"
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
              unit="ta"
              value={kpi?.totalFaculties ?? 0}
              icon={Building2}
              accentColor="green"
              trendText="100% akkreditatsiya"
              subMetrics={[
                { label: "Kafedralar", value: "54 ta" },
                { label: "Yo'nalishlar", value: "68 ta" },
                { label: "Mutaxassislik", value: "32 ta" },
              ]}
              isLoading={isLoading}
            />
            <div className="md:col-span-2 xl:col-span-1 [&>*]:h-full">
              <StatCard
                title="O'qituvchilar"
                unit="nafar"
                value={kpi?.totalTeachers ?? 0}
                icon={Users}
                accentColor="indigo"
                trendText="Ilmiy salohiyat: 44%"
                subMetrics={[
                  { label: "Fan doktori", value: "85 nafar" },
                  { label: "Falsafa doktori", value: "465 nafar" },
                  { label: "Prof. / dots.", value: "420 nafar" },
                ]}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        {/* 7.2. TALABALAR — 3 TA DOUGHNUT CHART */}
        <DashboardSection
          title="Talabalar kontingenti tuzilishi"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 1: Talabalar fakultetlar kesimida */}
            <ChartCard
              className="lg:col-span-2"
              title="Talabalar soni fakultetlar kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={students?.byFaculty ?? []}
                layout="side"
                centerLabel="Jami talaba"
                centerValue={kpi?.totalStudents}
                unit="nafar"
                height={200}
              />
            </ChartCard>

            {/* Chart 2: Talabalar ta'lim darajasi kesimida */}
            <ChartCard
              title="Talabalar soni ta'lim darajasi kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={students?.byLevel ?? []}
                layout="side"
                centerLabel="Jami talaba"
                centerValue={kpi?.totalStudents}
                unit="nafar"
                height={200}
              />
            </ChartCard>

            {/* Chart 3: Yotoqxona bilan ta'minlanganlik */}
            <ChartCard
              title="Yotoqxona bilan ta'minlanganlik"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <DoughnutChart
                data={dormSupplyData}
                layout="side"
                centerLabel="Ta'minlanganlik"
                centerValue={formatPercentage(students?.dormitorySupply?.providedRate)}
                unit="nafar"
                height={200}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.3. TALABALAR — BAR CHARTS */}
        <DashboardSection
          title="Ta'lim shakllari va kurslar tahlili"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 4: Ta'lim turi kesimida */}
            <ChartCard
              title="Ta'lim turi kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byType ?? []}
                unit="nafar"
                barColor="#425B94"
                height={250}
              />
            </ChartCard>

            {/* Chart 5: Kurslar kesimida */}
            <ChartCard
              title="Kurslar kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byCourse ?? []}
                unit="nafar"
                barColor="#5E6498"
                height={250}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.4. INFRATUZILMA */}
        <DashboardSection
          title="Infratuzilma va moddiy-texnik baza"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 6: Universitet binolari va sig'imi */}
            <ChartCard
              title="Universitet binolari va sig'imi"
              unit="o'rin"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <BuildingCapacityChart
                data={infrastructure?.buildings ?? []}
                unit="o'rin"
                height={270}
              />
            </ChartCard>

            {/* Chart 7: Yotoqxona sig'imi */}
            <ChartCard
              title="Yotoqxona sig'imi (Band va bo'sh o'rinlar)"
              unit="o'rin"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <StackedBarChart
                data={infrastructure?.dormitories ?? []}
                unit="o'rin"
                height={270}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.5. O'QITUVCHILAR VA ILMIY FAOLIYAT */}
        <DashboardSection
          title="O'qituvchilar va ilmiy salohiyat"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Chart 8: Ilmiy unvonlar */}
            <ChartCard
              title="Ilmiy unvonlar"
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
                height={240}
              />
            </ChartCard>

            {/* Chart 9: Ilmiy darajalar */}
            <ChartCard
              title="Ilmiy darajalar"
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
                height={240}
              />
            </ChartCard>

            {/* Chart 10: Ilmiy nashrlar */}
            <ChartCard
              title="Ilmiy nashrlar"
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
                height={240}
              />
            </ChartCard>
          </div>
        </DashboardSection>

        {/* 7.6. O'QITUVCHILAR FAKULTETLAR KESIMIDA */}
        <DashboardSection
          title="O'qituvchilar fakultetlar kesimida"
        >
          <ChartCard
            title="O'qituvchilar soni fakultetlar bo'yicha"
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
              barColor="#5E6498"
              allowSorting={true}
              minHeight={450}
            />
          </ChartCard>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}

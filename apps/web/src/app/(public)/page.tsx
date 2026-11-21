"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
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
import { KPI_CARDS, buildDormSupplySegments } from "@/features/dashboard/kpiCards";
import { REPORTING_PERIOD_OPTIONS } from "@/data/mocks/dashboard.mock";
import { enterFullscreen } from "@/components/presentation/fullscreen";

// Loaded on demand: the slideshow is only needed after the button is pressed.
const PresentationMode = dynamic(
  () => import("@/components/presentation/PresentationMode").then((m) => m.PresentationMode),
  { ssr: false }
);

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

  const [presenting, setPresenting] = useState(false);
  const handlePresent = () => {
    void enterFullscreen(); // must start inside the click (user gesture)
    setPresenting(true);
  };
  const periodLabel = REPORTING_PERIOD_OPTIONS.find((o) => o.id === period)?.label ?? period;

  // Safe fallback data while loading or in error state
  const kpi = data?.kpi;
  const students = data?.students;
  const infrastructure = data?.infrastructure;
  const teachersAndResearch = data?.teachersAndResearch;

  const dormSupplyData = buildDormSupplySegments(students?.dormitorySupply);

  return (
    <DashboardLayout
      period={period}
      onPeriodChange={setPeriod}
      lastUpdated={kpi?.lastUpdated}
      isRefreshing={isRefetching}
      onRefresh={refetch}
      onPresent={handlePresent}
      presentDisabled={!data}
    >
      <div className="space-y-4 pb-6">
        {/* 7.1. KPI CARDS */}
        <section aria-label="Asosiy ko'rsatkichlar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {KPI_CARDS.map((card, index) => (
              <div
                key={card.id}
                className={
                  index === 2 ? "md:col-span-2 xl:col-span-1 [&>*]:h-full" : "[&>*]:h-full"
                }
              >
                <StatCard
                  title={card.title}
                  unit={card.unit}
                  value={kpi?.[card.valueKey] ?? 0}
                  icon={card.icon}
                  accentColor={card.accent}
                  trendText={card.trendText}
                  subMetrics={card.subMetrics}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 7.2. TALABALAR — 3 TA DOUGHNUT CHART */}
        <DashboardSection
          title="Talabalar kontingenti tuzilishi"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Chart 1: Talabalar fakultetlar kesimida */}
            <ChartCard
              accent="blue"
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
              accent="blue"
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
              accent="blue"
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
              accent="blue"
              title="Ta'lim turi kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byType ?? []}
                unit="nafar"
                barColor="#3E5BA1"
                height={250}
              />
            </ChartCard>

            {/* Chart 5: Kurslar kesimida */}
            <ChartCard
              accent="blue"
              title="Kurslar kesimida"
              unit="nafar"
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              <VerticalBarChart
                data={students?.byCourse ?? []}
                unit="nafar"
                barColor="#5C61A2"
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
              accent="green"
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
              accent="green"
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
              accent="indigo"
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
              accent="indigo"
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
              accent="indigo"
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
              accent="indigo"
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
              barColor="#5C61A2"
              allowSorting={true}
              minHeight={450}
            />
          </ChartCard>
        </DashboardSection>
      </div>
      {presenting && data && (
        <PresentationMode
          data={data}
          periodLabel={periodLabel}
          onClose={() => setPresenting(false)}
        />
      )}
    </DashboardLayout>
  );
}

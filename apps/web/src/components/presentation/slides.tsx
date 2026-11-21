"use client";

import React from "react";
import { BuildingCapacityChart } from "@/components/charts/BuildingCapacityChart";
import { DoughnutChart } from "@/components/charts/DoughnutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import type { DashboardDataset } from "@/features/dashboard/types";
import {
  KPI_CARDS,
  buildDormSupplySegments,
  type KpiCardConfig,
} from "@/features/dashboard/kpiCards";
import { formatNumber, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CARD_THEMES, type CardAccent } from "@/components/dashboard/cardThemes";
import { Fit, type FitSize } from "./Fit";

export interface SlideContext {
  data: DashboardDataset;
  /** Two or more columns fit (wide landscape stage or wide scrolling layout). */
  wide: boolean;
  /** Fixed-size stage (content fills it) versus natural scrolling layout (phones). */
  stage: boolean;
}

export interface SlideDef {
  id: string;
  title: string;
  render: (ctx: SlideContext) => React.ReactNode;
}

/* ---------- layout primitives ---------- */

function SlideGrid({
  ctx,
  cols,
  children,
}: {
  ctx: SlideContext;
  cols: number;
  children: React.ReactNode;
}) {
  const count = React.Children.count(children);
  const columns = ctx.wide ? cols : 1;
  const rows = Math.ceil(count / columns);
  return (
    <div
      className={cn("grid gap-4", ctx.stage && "min-h-0 flex-1")}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        ...(ctx.stage ? { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` } : {}),
      }}
    >
      {children}
    </div>
  );
}

function PCard({
  title,
  unit,
  accent,
  children,
}: {
  title: string;
  unit?: string;
  accent: CardAccent;
  children: React.ReactNode;
}) {
  const theme = CARD_THEMES[accent];
  return (
    <section
      className={cn(
        "flex min-h-0 min-w-0 flex-col rounded-2xl border p-5 shadow-card",
        theme.surface
      )}
    >
      <header className="mb-2 flex items-center gap-2">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
        {unit && (
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", theme.chip)}>
            {unit}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

/** Ring diameter for a donut that must also leave room for its legend. */
function ring(size: FitSize, layout: "side" | "stacked", items: number): number {
  if (layout === "side") {
    return Math.max(140, Math.min(size.h - 8, Math.round(size.w * 0.46), 560));
  }
  return Math.max(140, Math.min(size.w - 16, size.h - items * 34 - 24, 340));
}

const stackedMin = (items: number) => 300 + items * 34 + 24;

function Donut({
  ctx,
  data,
  items = data.length,
  ...props
}: {
  ctx: SlideContext;
  data: { name: string; count: number; percentage?: number; color?: string; id?: string }[];
  items?: number;
  centerLabel: string;
  centerValue?: string | number;
  unit: string;
  forceStacked?: boolean;
}) {
  const { forceStacked, ...rest } = props;
  const layout = ctx.wide && !forceStacked ? "side" : "stacked";
  return (
    <Fit minHeight={layout === "stacked" ? stackedMin(items) : 260}>
      {(size) => (
        <DoughnutChart
          data={data}
          layout={layout}
          variant="presentation"
          height={ring(size, layout, items)}
          {...rest}
        />
      )}
    </Fit>
  );
}

/* ---------- KPI cards ---------- */

const ACCENTS = {
  blue: {
    bar: "border-t-primary",
    bg: "from-[#D9E4F8] via-[#EBF1FB] to-white",
    icon: "bg-[#EEF2F9] text-[#3E5BA1] ring-[#DCE4F2]",
  },
  green: {
    bar: "border-t-[#539883]",
    bg: "from-[#D0EBE0] via-[#E8F5EF] to-white",
    icon: "bg-[#EDF5F2] text-[#2F7561] ring-[#D9EAE3]",
  },
  indigo: {
    bar: "border-t-[#5C61A2]",
    bg: "from-[#DDDFF5] via-[#EDEEF9] to-white",
    icon: "bg-[#F0F0F8] text-[#5C61A2] ring-[#E1E2F1]",
  },
} as const;

function BigStat({ card, value }: { card: KpiCardConfig; value: number }) {
  const accent = ACCENTS[card.accent];
  const Icon = card.icon;
  return (
    <article
      className={cn(
        "flex min-w-0 flex-col justify-between gap-8 rounded-3xl border border-t-4 border-slate-200 bg-gradient-to-br p-7 shadow-card sm:min-h-[400px] sm:p-9",
        accent.bar,
        accent.bg
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-600 sm:text-base">
            {card.title}
          </p>
          <span className="mt-2 inline-block rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-white">
            {card.trendText}
          </span>
        </div>
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-16 sm:w-16",
            accent.icon
          )}
        >
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
        </span>
      </div>
      <p className="flex items-baseline gap-3">
        <span className="text-6xl font-extrabold leading-none tracking-tight text-slate-900 tabular-nums sm:text-7xl xl:text-[96px]">
          {formatNumber(value)}
        </span>
        <span className="text-xl font-semibold text-slate-500 sm:text-2xl">{card.unit}</span>
      </p>
      <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl bg-white/75 py-4 ring-1 ring-white">
        {card.subMetrics.map((m) => (
          <div key={m.label} className="flex min-w-0 flex-col px-3 sm:px-4">
            <dt className="text-xs font-medium leading-tight text-slate-600 sm:text-sm">{m.label}</dt>
            <dd className="mt-1 whitespace-nowrap text-base font-bold text-slate-900 tabular-nums sm:text-lg">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/* ---------- slides ---------- */

export const SLIDES: SlideDef[] = [
  {
    id: "kpi",
    title: "Asosiy ko'rsatkichlar",
    render: (ctx) => (
      <div className={cn("flex items-center", ctx.stage && "min-h-0 flex-1")}>
        <div
          className="grid w-full gap-5"
          style={{ gridTemplateColumns: `repeat(${ctx.wide ? 3 : 1}, minmax(0, 1fr))` }}
        >
          {KPI_CARDS.map((card) => (
            <BigStat key={card.id} card={card} value={ctx.data.kpi[card.valueKey]} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "students-faculty",
    title: "Talabalar soni fakultetlar kesimida",
    render: (ctx) => (
      <SlideGrid ctx={ctx} cols={1}>
        <PCard accent="blue" title="Talabalar soni fakultetlar kesimida" unit="nafar">
          <Donut
            ctx={ctx}
            data={ctx.data.students.byFaculty}
            centerLabel="Jami talaba"
            centerValue={ctx.data.kpi.totalStudents}
            unit="nafar"
          />
        </PCard>
      </SlideGrid>
    ),
  },
  {
    id: "students-level",
    title: "Talabalar tarkibi va yotoqxona bilan ta'minlanganlik",
    render: (ctx) => (
      <SlideGrid ctx={ctx} cols={2}>
        <PCard accent="blue" title="Ta'lim darajasi kesimida" unit="nafar">
          <Donut
            ctx={ctx}
            data={ctx.data.students.byLevel}
            centerLabel="Jami talaba"
            centerValue={ctx.data.kpi.totalStudents}
            unit="nafar"
          />
        </PCard>
        <PCard accent="blue" title="Yotoqxona bilan ta'minlanganlik" unit="nafar">
          <Donut
            ctx={ctx}
            data={buildDormSupplySegments(ctx.data.students.dormitorySupply)}
            centerLabel="Ta'minlanganlik"
            centerValue={formatPercentage(ctx.data.students.dormitorySupply.providedRate)}
            unit="nafar"
          />
        </PCard>
      </SlideGrid>
    ),
  },
  {
    id: "students-bars",
    title: "Ta'lim shakllari va kurslar tahlili",
    render: (ctx) => (
      <SlideGrid ctx={ctx} cols={2}>
        <PCard accent="blue" title="Ta'lim turi kesimida" unit="nafar">
          <Fit minHeight={280}>
            {(s) => (
              <VerticalBarChart
                data={ctx.data.students.byType}
                unit="nafar"
                barColor="#3E5BA1"
                height={s.h}
              />
            )}
          </Fit>
        </PCard>
        <PCard accent="blue" title="Kurslar kesimida" unit="nafar">
          <Fit minHeight={280}>
            {(s) => (
              <VerticalBarChart
                data={ctx.data.students.byCourse}
                unit="nafar"
                barColor="#5C61A2"
                height={s.h}
              />
            )}
          </Fit>
        </PCard>
      </SlideGrid>
    ),
  },
  {
    id: "infrastructure",
    title: "Infratuzilma va moddiy-texnik baza",
    render: (ctx) => (
      <SlideGrid ctx={ctx} cols={2}>
        <PCard accent="green" title="Universitet binolari va sig'imi" unit="o'rin">
          <Fit minHeight={300}>
            {(s) => (
              <BuildingCapacityChart
                data={ctx.data.infrastructure.buildings}
                unit="o'rin"
                height={s.h}
              />
            )}
          </Fit>
        </PCard>
        <PCard accent="green" title="Yotoqxona sig'imi (band va bo'sh o'rinlar)" unit="o'rin">
          <Fit minHeight={300}>
            {(s) => (
              <StackedBarChart
                data={ctx.data.infrastructure.dormitories}
                unit="o'rin"
                height={s.h}
              />
            )}
          </Fit>
        </PCard>
      </SlideGrid>
    ),
  },
  {
    id: "teachers",
    title: "O'qituvchilar va ilmiy salohiyat",
    render: (ctx) => {
      const { teachersAndResearch: t, kpi } = ctx.data;
      const publications = t.publications.map((p) => ({ ...p, name: p.category }));
      return (
        <SlideGrid ctx={ctx} cols={3}>
          <PCard accent="indigo" title="Ilmiy unvonlar" unit="nafar">
            <Donut
              ctx={ctx}
              forceStacked
              data={t.byTitle}
              centerLabel="Jami o'qituvchi"
              centerValue={kpi.totalTeachers}
              unit="nafar"
            />
          </PCard>
          <PCard accent="indigo" title="Ilmiy darajalar" unit="nafar">
            <Donut
              ctx={ctx}
              forceStacked
              data={t.byDegree}
              centerLabel="Jami o'qituvchi"
              centerValue={kpi.totalTeachers}
              unit="nafar"
            />
          </PCard>
          <PCard accent="indigo" title="Ilmiy nashrlar" unit="ta">
            <Donut
              ctx={ctx}
              forceStacked
              data={publications}
              centerLabel="Jami nashrlar"
              centerValue={publications.reduce((sum, p) => sum + p.count, 0)}
              unit="ta"
            />
          </PCard>
        </SlideGrid>
      );
    },
  },
  {
    id: "teachers-faculty",
    title: "O'qituvchilar soni fakultetlar bo'yicha",
    render: (ctx) => (
      <SlideGrid ctx={ctx} cols={1}>
        <PCard accent="indigo" title="O'qituvchilar soni fakultetlar bo'yicha" unit="nafar">
          <Fit minHeight={460}>
            {(s) => (
              <HorizontalBarChart
                data={ctx.data.teachersAndResearch.byFaculty.map((f) => ({
                  id: f.id,
                  name: f.facultyName,
                  count: f.teacherCount,
                  dscCount: f.dscCount,
                  phdCount: f.phdCount,
                }))}
                unit="nafar"
                barColor="#5C61A2"
                allowSorting={false}
                showToolbar={false}
                height={s.h}
              />
            )}
          </Fit>
        </PCard>
      </SlideGrid>
    ),
  },
];

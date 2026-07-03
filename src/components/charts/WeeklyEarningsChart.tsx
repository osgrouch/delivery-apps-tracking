"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps, XAxisTickContentProps } from "recharts";

import { getWeeklyEarnings } from "@/lib/actions/dashboard";
import { addDaysISO, type WeeklyDayEarnings } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/utils/format";
import type { App } from "@/types/database.types";

const APP_BRAND_COLORS: Record<string, string> = {
  "uber eats": "#286ef0",
  doordash: "#f72e09",
  instacart: "#09af07",
};
const FALLBACK_COLORS = ["#9333ea", "#0891b2", "#f59e0b", "#64748b"];

function colorForApp(appName: string, fallbackIndex: number): string {
  return APP_BRAND_COLORS[appName.toLowerCase()] ?? FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

function WeekdayTick({ x, y, payload, days }: XAxisTickContentProps & { days: WeeklyDayEarnings[] }) {
  const day = days.find((d) => d.date === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={14} textAnchor="middle" className="fill-zinc-700 text-xs font-medium dark:fill-zinc-300">
        {day?.weekday ?? ""}
      </text>
      <text dy={28} textAnchor="middle" className="fill-zinc-400 text-[10px] dark:fill-zinc-500">
        {day ? formatShortDate(day.date) : ""}
      </text>
    </g>
  );
}

function WeeklyTooltip({
  active,
  payload,
  colorByAppId,
}: TooltipContentProps & { colorByAppId: Map<number, string> }) {
  if (!active || !payload || payload.length === 0) return null;
  const day = payload[0].payload as WeeklyDayEarnings;

  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-xs shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">
        {day.weekday}, {formatShortDate(day.date)}
      </p>
      <div className="flex flex-col gap-1">
        {day.byApp.map((app) => (
          <div key={app.appId} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colorByAppId.get(app.appId) }}
              />
              {app.appName}
            </span>
            <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {formatCurrency(app.earnings)} · {formatNumber(app.hours)}h ·{" "}
              {formatCurrency(app.dollarsPerHour)}/hr
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-zinc-200 pt-2 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
        <span>Total</span>
        <span className="tabular-nums">
          {formatCurrency(day.totalEarnings)} · {formatNumber(day.totalHours)}h ·{" "}
          {formatCurrency(day.avgDollarsPerHour)}/hr
        </span>
      </div>
    </div>
  );
}

interface WeeklyEarningsChartProps {
  apps: App[];
  initialWeekStart: string;
  initialData: WeeklyDayEarnings[];
}

export function WeeklyEarningsChart({ apps, initialWeekStart, initialData }: WeeklyEarningsChartProps) {
  const [maxWeekStart] = useState(initialWeekStart);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [days, setDays] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const colorByAppId = useMemo(
    () => new Map(apps.map((app, index) => [app.id, colorForApp(app.name, index)])),
    [apps],
  );

  function changeWeek(offsetDays: number) {
    const nextWeekStart = addDaysISO(weekStart, offsetDays);
    startTransition(async () => {
      const nextDays = await getWeeklyEarnings(nextWeekStart);
      setWeekStart(nextWeekStart);
      setDays(nextDays);
    });
  }

  const weekEnd = addDaysISO(weekStart, 6);
  const isCurrentWeek = weekStart >= maxWeekStart;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Weekly earnings by app
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => changeWeek(-7)}
            disabled={isPending}
            aria-label="Previous week"
            className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            ←
          </button>
          <span className="whitespace-nowrap">
            {formatShortDate(weekStart)}–{formatShortDate(weekEnd)}
          </span>
          <button
            type="button"
            onClick={() => changeWeek(7)}
            disabled={isPending || isCurrentWeek}
            aria-label="Next week"
            className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            →
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={days} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="date"
            interval={0}
            height={44}
            tick={(props: XAxisTickContentProps) => <WeekdayTick {...props} days={days} />}
          />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            width={72}
          />
          <Tooltip
            content={(props) => <WeeklyTooltip {...props} colorByAppId={colorByAppId} />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {apps.map((app, index) => (
            <Bar
              key={app.id}
              dataKey={(entry: WeeklyDayEarnings) =>
                entry.byApp.find((a) => a.appId === app.id)?.earnings ?? 0
              }
              name={app.name}
              stackId="earnings"
              fill={colorForApp(app.name, index)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

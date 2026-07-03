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
import type { TooltipContentProps } from "recharts";

import { EarningsBreakdownTooltip } from "@/components/charts/EarningsBreakdownTooltip";
import { getMonthlyEarnings } from "@/lib/actions/dashboard";
import type { MonthlyEarnings } from "@/lib/utils/aggregate";
import { colorForApp } from "@/lib/utils/appColors";
import { formatCurrency } from "@/lib/utils/format";
import type { App } from "@/types/database.types";

function MonthlyTooltip({
  active,
  payload,
  year,
  colorByAppId,
}: TooltipContentProps & { year: number; colorByAppId: Map<number, string> }) {
  if (!active || !payload || payload.length === 0) return null;
  const month = payload[0].payload as MonthlyEarnings;

  return (
    <EarningsBreakdownTooltip
      header={`${month.monthLabel} ${year}`}
      byApp={month.byApp}
      totalEarnings={month.totalEarnings}
      totalHours={month.totalHours}
      avgDollarsPerHour={month.avgDollarsPerHour}
      colorByAppId={colorByAppId}
    />
  );
}

interface MonthlyEarningsChartProps {
  apps: App[];
  initialYear: number;
  initialData: MonthlyEarnings[];
  minYear: number;
  maxYear: number;
}

export function MonthlyEarningsChart({
  apps,
  initialYear,
  initialData,
  minYear,
  maxYear,
}: MonthlyEarningsChartProps) {
  const [year, setYear] = useState(initialYear);
  const [months, setMonths] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const colorByAppId = useMemo(
    () => new Map(apps.map((app, index) => [app.id, colorForApp(app.name, index)])),
    [apps],
  );

  function changeYear(offset: number) {
    const nextYear = year + offset;
    startTransition(async () => {
      const nextMonths = await getMonthlyEarnings(nextYear);
      setYear(nextYear);
      setMonths(nextMonths);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Monthly earnings by app
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => changeYear(-1)}
            disabled={isPending || year <= minYear}
            aria-label="Previous year"
            className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            ←
          </button>
          <span className="whitespace-nowrap">{year}</span>
          <button
            type="button"
            onClick={() => changeYear(1)}
            disabled={isPending || year >= maxYear}
            aria-label="Next year"
            className="rounded-md border border-zinc-300 px-2 py-1 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            →
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={months} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis dataKey="monthLabel" interval={0} tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            tick={{ fontSize: 12 }}
            width={72}
          />
          <Tooltip
            content={(props) => <MonthlyTooltip {...props} year={year} colorByAppId={colorByAppId} />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {apps.map((app, index) => (
            <Bar
              key={app.id}
              dataKey={(entry: MonthlyEarnings) =>
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

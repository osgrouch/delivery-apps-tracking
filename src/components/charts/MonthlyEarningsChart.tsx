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
import { NavArrowButton } from "@/components/ui/NavArrowButton";
import { NumberSpinner } from "@/components/ui/NumberSpinner";
import { getMonthlyEarnings } from "@/lib/actions/dashboard";
import type { MonthlyEarnings } from "@/lib/utils/aggregate";
import {
  CHART_CURSOR_FILL,
  CHART_GRID_STROKE,
  CHART_LEGEND_STYLE,
  CHART_TICK_STYLE,
} from "@/lib/utils/chartTheme";
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
  /** "arrows" (default): prev/next buttons. "spinner": a directly-editable NumberSpinner. */
  yearControl?: "arrows" | "spinner";
  height?: number | `${number}%`;
}

export function MonthlyEarningsChart({
  apps,
  initialYear,
  initialData,
  minYear,
  maxYear,
  yearControl = "arrows",
  height = 320,
}: MonthlyEarningsChartProps) {
  const [year, setYear] = useState(initialYear);
  const [months, setMonths] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const colorByAppId = useMemo(() => new Map(apps.map((app) => [app.id, app.color])), [apps]);

  function changeYear(nextYear: number) {
    const clamped = Math.min(maxYear, Math.max(minYear, nextYear));
    if (clamped === year) return;
    startTransition(async () => {
      const nextMonths = await getMonthlyEarnings(clamped);
      setYear(clamped);
      setMonths(nextMonths);
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-secondary-foreground">Monthly earnings by app</h2>
        {yearControl === "spinner" ? (
          <NumberSpinner
            value={year}
            digits={4}
            ariaLabel="year"
            onIncrement={() => changeYear(year + 1)}
            onDecrement={() => changeYear(year - 1)}
            onCommitText={(parsed) => changeYear(parsed)}
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <NavArrowButton
              direction="prev"
              label="Previous year"
              onClick={() => changeYear(year - 1)}
              disabled={isPending || year <= minYear}
            />
            <span className="whitespace-nowrap">{year}</span>
            <NavArrowButton
              direction="next"
              label="Next year"
              onClick={() => changeYear(year + 1)}
              disabled={isPending || year >= maxYear}
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={months} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
            <XAxis dataKey="monthLabel" interval={0} tick={CHART_TICK_STYLE} />
            <YAxis
              tickFormatter={(value: number) => formatCurrency(value)}
              tick={CHART_TICK_STYLE}
              width={72}
            />
            <Tooltip
              content={(props) => <MonthlyTooltip {...props} year={year} colorByAppId={colorByAppId} />}
              cursor={CHART_CURSOR_FILL}
            />
            <Legend wrapperStyle={CHART_LEGEND_STYLE} />
            {apps.map((app) => (
              <Bar
                key={app.id}
                dataKey={(entry: MonthlyEarnings) =>
                  entry.byApp.find((a) => a.appId === app.id)?.earnings ?? 0
                }
                name={app.name}
                stackId="earnings"
                fill={colorByAppId.get(app.id)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

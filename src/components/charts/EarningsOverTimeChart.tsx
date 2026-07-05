"use client";

import { useState, useTransition } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { NavArrowButton } from "@/components/ui/NavArrowButton";
import { getEarningsOverTime } from "@/lib/actions/dashboard";
import type { WeeklyTotal } from "@/lib/utils/aggregate";
import { CHART_GRID_STROKE, CHART_PRIMARY_COLOR, CHART_TICK_STYLE, CHART_TOOLTIP_STYLE } from "@/lib/utils/chartTheme";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";

interface EarningsOverTimeChartProps {
  initialYear: number;
  initialData: WeeklyTotal[];
  minYear: number;
  maxYear: number;
}

export function EarningsOverTimeChart({
  initialYear,
  initialData,
  minYear,
  maxYear,
}: EarningsOverTimeChartProps) {
  const [year, setYear] = useState(initialYear);
  const [weeks, setWeeks] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function changeYear(offset: number) {
    const nextYear = year + offset;
    startTransition(async () => {
      const nextWeeks = await getEarningsOverTime(nextYear);
      setYear(nextYear);
      setWeeks(nextWeeks);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-secondary-foreground">Weekly earnings over time</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <NavArrowButton
            direction="prev"
            label="Previous year"
            onClick={() => changeYear(-1)}
            disabled={isPending || year <= minYear}
          />
          <span className="whitespace-nowrap">{year}</span>
          <NavArrowButton
            direction="next"
            label="Next year"
            onClick={() => changeYear(1)}
            disabled={isPending || year >= maxYear}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={288}>
        <LineChart data={weeks} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
          <XAxis dataKey="weekStart" tickFormatter={formatShortDate} tick={CHART_TICK_STYLE} minTickGap={24} />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value)}
            tick={CHART_TICK_STYLE}
            width={72}
          />
          <Tooltip
            labelFormatter={(label) => `Week of ${formatShortDate(String(label))}`}
            formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Line type="monotone" dataKey="totalEarnings" stroke={CHART_PRIMARY_COLOR} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

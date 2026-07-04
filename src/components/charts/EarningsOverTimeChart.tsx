"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EarningsByDate } from "@/lib/utils/aggregate";
import { CHART_GRID_STROKE, CHART_PRIMARY_COLOR, CHART_TICK_STYLE, CHART_TOOLTIP_STYLE } from "@/lib/utils/chartTheme";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function EarningsOverTimeChart({ data }: { data: EarningsByDate[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        No shifts in this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={CHART_TICK_STYLE} minTickGap={24} />
        <YAxis
          tickFormatter={(value: number) => formatCurrency(value)}
          tick={CHART_TICK_STYLE}
          width={72}
        />
        <Tooltip
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Line type="monotone" dataKey="earnings" stroke={CHART_PRIMARY_COLOR} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

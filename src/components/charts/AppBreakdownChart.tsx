"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EarningsByApp } from "@/lib/utils/aggregate";
import { CHART_GRID_STROKE, CHART_PRIMARY_COLOR, CHART_TICK_STYLE, CHART_TOOLTIP_STYLE } from "@/lib/utils/chartTheme";
import { formatCurrency } from "@/lib/utils/format";

interface AppBreakdownChartProps {
  data: EarningsByApp[];
  colorByAppName: Map<string, string>;
}

export function AppBreakdownChart({ data, colorByAppName }: AppBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        No shifts in this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis dataKey="appName" tick={CHART_TICK_STYLE} />
        <YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={CHART_TICK_STYLE} width={72} />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
          contentStyle={CHART_TOOLTIP_STYLE}
        />
        <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.appName} fill={colorByAppName.get(entry.appName) ?? CHART_PRIMARY_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

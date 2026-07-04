"use client";

import { useMemo } from "react";
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

import { EarningsBreakdownTooltip } from "@/components/charts/EarningsBreakdownTooltip";
import type { WeeklyDayEarnings } from "@/lib/utils/aggregate";
import { colorForApp } from "@/lib/utils/appColors";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import type { App } from "@/types/database.types";

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
    <EarningsBreakdownTooltip
      header={`${day.weekday}, ${formatShortDate(day.date)}`}
      byApp={day.byApp}
      totalEarnings={day.totalEarnings}
      totalHours={day.totalHours}
      avgDollarsPerHour={day.avgDollarsPerHour}
      colorByAppId={colorByAppId}
    />
  );
}

interface WeeklyEarningsBarChartProps {
  apps: App[];
  days: WeeklyDayEarnings[];
  height?: number | `${number}%`;
}

/** Pure presentational stacked bar chart, shared by the dashboard's weekly card and the /weekly focus page. */
export function WeeklyEarningsBarChart({ apps, days, height = 320 }: WeeklyEarningsBarChartProps) {
  const colorByAppId = useMemo(
    () => new Map(apps.map((app, index) => [app.id, colorForApp(app.name, index)])),
    [apps],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
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
  );
}

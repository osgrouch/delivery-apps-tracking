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
import {
  CHART_CURSOR_FILL,
  CHART_GRID_STROKE,
  CHART_LEGEND_STYLE,
  CHART_TICK_STYLE,
} from "@/lib/utils/chartTheme";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import type { App } from "@/types/database.types";

function WeekdayTick({ x, y, payload, days }: XAxisTickContentProps & { days: WeeklyDayEarnings[] }) {
  const day = days.find((d) => d.date === payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={14} textAnchor="middle" className="fill-foreground text-xs font-medium">
        {day?.weekday ?? ""}
      </text>
      <text dy={28} textAnchor="middle" className="fill-muted-foreground text-[10px]">
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
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
        <XAxis
          dataKey="date"
          interval={0}
          height={44}
          tick={(props: XAxisTickContentProps) => <WeekdayTick {...props} days={days} />}
        />
        <YAxis
          tickFormatter={(value: number) => formatCurrency(value)}
          tick={CHART_TICK_STYLE}
          width={72}
        />
        <Tooltip
          content={(props) => <WeeklyTooltip {...props} colorByAppId={colorByAppId} />}
          cursor={CHART_CURSOR_FILL}
        />
        <Legend wrapperStyle={CHART_LEGEND_STYLE} />
        {apps.map((app) => (
          <Bar
            key={app.id}
            dataKey={(entry: WeeklyDayEarnings) =>
              entry.byApp.find((a) => a.appId === app.id)?.earnings ?? 0
            }
            name={app.name}
            stackId="earnings"
            fill={colorByAppId.get(app.id)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

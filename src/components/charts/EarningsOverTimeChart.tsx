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
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function EarningsOverTimeChart({ data }: { data: EarningsByDate[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-zinc-400">
        No shifts in this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(value: number) => formatCurrency(value)}
          tick={{ fontSize: 12 }}
          width={72}
        />
        <Tooltip
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value) => [formatCurrency(Number(value)), "Earnings"]}
        />
        <Line
          type="monotone"
          dataKey="earnings"
          stroke="#18181b"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

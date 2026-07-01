"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EarningsByApp } from "@/lib/utils/aggregate";
import { formatCurrency } from "@/lib/utils/format";

const BAR_COLOR = "#3f3f46";

export function AppBreakdownChart({ data }: { data: EarningsByApp[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-zinc-400">
        No shifts in this range yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
        <XAxis dataKey="appName" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value: number) => formatCurrency(value)} tick={{ fontSize: 12 }} width={72} />
        <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Earnings"]} />
        <Bar dataKey="earnings" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useState, useTransition } from "react";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { getWeeklyEarnings } from "@/lib/actions/dashboard";
import { addDaysISO, type WeeklyDayEarnings } from "@/lib/utils/aggregate";
import { formatShortDate } from "@/lib/utils/format";
import type { App } from "@/types/database.types";

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

      <WeeklyEarningsBarChart apps={apps} days={days} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { NavArrowButton } from "@/components/ui/NavArrowButton";
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
        <h2 className="text-sm font-medium text-secondary-foreground">Weekly earnings by app</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <NavArrowButton
            direction="prev"
            label="Previous week"
            onClick={() => changeWeek(-7)}
            disabled={isPending}
          />
          <span className="whitespace-nowrap">
            {formatShortDate(weekStart)}–{formatShortDate(weekEnd)}
          </span>
          <NavArrowButton
            direction="next"
            label="Next week"
            onClick={() => changeWeek(7)}
            disabled={isPending || isCurrentWeek}
          />
        </div>
      </div>

      <WeeklyEarningsBarChart apps={apps} days={days} />
    </div>
  );
}

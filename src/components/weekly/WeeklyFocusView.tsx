"use client";

import { useMemo, useState } from "react";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { DayRow } from "@/components/weekly/DayRow";
import { WeekCalendar } from "@/components/weekly/WeekCalendar";
import {
  addDaysISO,
  aggregateWeekByApp,
  groupShiftsByWeekday,
  type DateApp,
} from "@/lib/utils/aggregate";
import { colorForApp } from "@/lib/utils/appColors";
import { formatShortDate } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

const WEEKDAY_FULL_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface WeeklyFocusViewProps {
  apps: App[];
  shifts: ShiftWithApp[];
  weekStarts: string[];
  initialWeekStart: string;
  appsByDate: Record<string, DateApp[]>;
}

export function WeeklyFocusView({
  apps,
  shifts,
  weekStarts,
  initialWeekStart,
  appsByDate,
}: WeeklyFocusViewProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(initialWeekStart);

  const colorByAppId = useMemo(
    () => new Map(apps.map((app, index) => [app.id, colorForApp(app.name, index)])),
    [apps],
  );

  const selectedWeekData = useMemo(
    () => aggregateWeekByApp(shifts, apps, selectedWeekStart),
    [shifts, apps, selectedWeekStart],
  );

  const shiftsByWeekday = useMemo(
    () => groupShiftsByWeekday(shifts, selectedWeekStart),
    [shifts, selectedWeekStart],
  );

  return (
    <div className="grid h-full w-full grid-cols-[35%_75%] overflow-hidden">
      <div className="grid min-h-0 grid-rows-[45%_55%] border-r border-zinc-200 dark:border-zinc-800">
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Weekly earnings by app
            </h2>
            <p className="text-xs text-zinc-400">
              {formatShortDate(selectedWeekStart)}–{formatShortDate(addDaysISO(selectedWeekStart, 6))}
            </p>
          </div>
          <div className="min-h-0 flex-1">
            <WeeklyEarningsBarChart apps={apps} days={selectedWeekData} height="100%" />
          </div>
        </div>

        <div className="min-h-0">
          <WeekCalendar
            weekStarts={weekStarts}
            selectedWeekStart={selectedWeekStart}
            onSelectWeek={setSelectedWeekStart}
            appsByDate={appsByDate}
            colorByAppId={colorByAppId}
          />
        </div>
      </div>

      <div className="min-h-0 overflow-x-hidden overflow-y-auto">
        {WEEKDAY_FULL_LABELS.map((label, index) => (
          <DayRow
            key={label}
            label={label}
            date={addDaysISO(selectedWeekStart, index)}
            shifts={shiftsByWeekday[index]}
            colorByAppId={colorByAppId}
          />
        ))}
      </div>
    </div>
  );
}

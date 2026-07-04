"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { DayRow } from "@/components/weekly/DayRow";
import { WeekCalendar } from "@/components/weekly/WeekCalendar";
import { Spinner } from "@/components/ui/Spinner";
import {
  addDaysISO,
  aggregateWeekByApp,
  computeTotals,
  groupShiftsByWeekday,
  type DateApp,
} from "@/lib/utils/aggregate";
import { colorForApp } from "@/lib/utils/appColors";
import { formatCurrency, formatNumber, formatShortDate } from "@/lib/utils/format";
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
  today: string;
}

export function WeeklyFocusView({
  apps,
  shifts,
  weekStarts,
  initialWeekStart,
  appsByDate,
  today,
}: WeeklyFocusViewProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(initialWeekStart);
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    };
  }, []);

  function handleSelectWeek(weekStart: string) {
    if (weekStart === selectedWeekStart) return;
    setSelectedWeekStart(weekStart);
    setIsChangingWeek(true);
    if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    changeTimeoutRef.current = setTimeout(() => setIsChangingWeek(false), 700);
  }

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

  const selectedWeekShifts = useMemo(() => shiftsByWeekday.flat(), [shiftsByWeekday]);

  const weekTotals = useMemo(() => computeTotals(selectedWeekShifts), [selectedWeekShifts]);

  const footerItems = useMemo(
    () => [
      { label: "Week Total", value: formatCurrency(weekTotals.totalEarnings) },
      { label: "Total Miles", value: `${formatNumber(weekTotals.totalMileage)} mi` },
      { label: "Total Trips", value: weekTotals.totalTrips.toString() },
      { label: "Total Hours", value: `${formatNumber(weekTotals.totalHours)}h` },
      { label: "Avg $/Hour", value: formatCurrency(weekTotals.avgDollarsPerHour) },
      { label: "Avg $/Mile", value: formatCurrency(weekTotals.avgDollarsPerMile) },
    ],
    [weekTotals],
  );

  return (
    <div className="grid h-full w-full grid-cols-[30%_70%] overflow-hidden">
      <div className="grid min-h-0 grid-rows-[45%_55%] border-r border-border">
        <div className="flex min-h-0 flex-col gap-2 overflow-hidden border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-secondary-foreground">Weekly Earnings by App</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {formatShortDate(selectedWeekStart)}–{formatShortDate(addDaysISO(selectedWeekStart, 6))}
            </p>
          </div>
          <div className="relative min-h-0 flex-1">
            <WeeklyEarningsBarChart apps={apps} days={selectedWeekData} height="100%" />
            {isChangingWeek ? (
              <div className="absolute inset-0 flex items-center justify-center bg-card/70 backdrop-blur-sm">
                <Spinner />
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-h-0">
          <WeekCalendar
            weekStarts={weekStarts}
            selectedWeekStart={selectedWeekStart}
            onSelectWeek={handleSelectWeek}
            appsByDate={appsByDate}
            colorByAppId={colorByAppId}
            today={today}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-x-hidden overflow-y-auto">
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
          {isChangingWeek ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <Spinner />
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-8 border-t border-border bg-card/40 px-6 py-3">
          {footerItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {item.label}
              </span>
              <span className="font-mono text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

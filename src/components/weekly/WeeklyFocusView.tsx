"use client";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { Spinner } from "@/components/ui/Spinner";
import { DayRow } from "@/components/weekly/DayRow";
import { WeekCalendar } from "@/components/weekly/WeekCalendar";
import { WeeklyFocusViewMobile } from "@/components/weekly/WeeklyFocusViewMobile";
import { useWeeklyFocusData } from "@/components/weekly/useWeeklyFocusData";
import { addDaysISO, type DateApp } from "@/lib/utils/aggregate";
import { formatShortDate, formatWeekRangeTitle } from "@/lib/utils/format";
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
  const {
    selectedWeekStart,
    isChangingWeek,
    handleSelectWeek,
    colorByAppId,
    selectedWeekData,
    shiftsByWeekday,
    footerItems,
  } = useWeeklyFocusData({ apps, shifts, initialWeekStart });

  return (
    <>
      <div className="hidden h-full w-full grid-rows-[1fr_auto] overflow-hidden md:grid">
        <div className="grid min-h-0 grid-cols-[30%_70%] overflow-hidden">
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

          <div className="relative min-h-0">
            <div className="h-full overflow-x-hidden overflow-y-auto">
              {WEEKDAY_FULL_LABELS.map((label, index) => (
                <DayRow
                  key={label}
                  label={label}
                  date={addDaysISO(selectedWeekStart, index)}
                  shifts={shiftsByWeekday[index]}
                  colorByAppId={colorByAppId}
                  apps={apps}
                />
              ))}
            </div>
            {isChangingWeek ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <Spinner />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-[30%_70%] border-t border-border bg-card/40">
          <div className="flex items-center justify-center border-r border-border px-6 py-3">
            <span className="text-lg font-semibold text-foreground">
              {formatWeekRangeTitle(selectedWeekStart, addDaysISO(selectedWeekStart, 6))}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-8 px-6 py-3">
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

      <WeeklyFocusViewMobile
        apps={apps}
        weekStarts={weekStarts}
        appsByDate={appsByDate}
        today={today}
        selectedWeekStart={selectedWeekStart}
        isChangingWeek={isChangingWeek}
        handleSelectWeek={handleSelectWeek}
        colorByAppId={colorByAppId}
        selectedWeekData={selectedWeekData}
        shiftsByWeekday={shiftsByWeekday}
        footerItems={footerItems}
      />
    </>
  );
}

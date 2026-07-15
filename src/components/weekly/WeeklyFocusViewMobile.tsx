"use client";

import { useEffect, useRef, useState } from "react";

import { WeeklyEarningsBarChart } from "@/components/charts/WeeklyEarningsBarChart";
import { Spinner } from "@/components/ui/Spinner";
import { DayLabelBlock } from "@/components/weekly/DayLabelBlock";
import { DayRow } from "@/components/weekly/DayRow";
import { WeekCalendar } from "@/components/weekly/WeekCalendar";
import type { WeeklyFooterItem } from "@/components/weekly/useWeeklyFocusData";
import { addDaysISO, type DateApp, type WeeklyDayEarnings } from "@/lib/utils/aggregate";
import { formatShortDate, formatWeekRangeTitle } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

const WEEKDAY_SHORT_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeeklyFocusViewMobileProps {
  apps: App[];
  weekStarts: string[];
  appsByDate: Record<string, DateApp[]>;
  today: string;
  selectedWeekStart: string;
  isChangingWeek: boolean;
  handleSelectWeek: (weekStart: string) => void;
  colorByAppId: Map<number, string>;
  selectedWeekData: WeeklyDayEarnings[];
  shiftsByWeekday: ShiftWithApp[][];
  footerItems: WeeklyFooterItem[];
}

/**
 * Mobile-only /weekly layout: the chart+calendar render at full width as a
 * background layer, and the day-rows list is a right-docked drawer that
 * toggles between a compact weekday strip and an expanded full list,
 * leaving a peek-gap over the background when expanded. See
 * useWeeklyFocusData for the shared state this consumes (also used by the
 * desktop tree in WeeklyFocusView.tsx).
 */
export function WeeklyFocusViewMobile({
  apps,
  weekStarts,
  appsByDate,
  today,
  selectedWeekStart,
  isChangingWeek,
  handleSelectWeek,
  colorByAppId,
  selectedWeekData,
  shiftsByWeekday,
  footerItems,
}: WeeklyFocusViewMobileProps) {
  const [expanded, setExpanded] = useState(false);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingScrollIndexRef = useRef<number | null>(null);

  function handleTapCompactDay(index: number) {
    pendingScrollIndexRef.current = index;
    setExpanded(true);
  }

  useEffect(() => {
    if (expanded && pendingScrollIndexRef.current !== null) {
      dayRefs.current[pendingScrollIndexRef.current]?.scrollIntoView({ block: "start" });
      pendingScrollIndexRef.current = null;
    }
  }, [expanded]);

  return (
    <div className="flex h-full w-full flex-col md:hidden">
      <div className="relative min-h-0 flex-1">
        <div className="mr-24 grid h-full grid-rows-[45%_55%]">
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

        {expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Collapse day list and show full calendar"
            className="absolute inset-y-0 left-0 z-10 w-24"
          />
        ) : null}

        <div
          className={`absolute inset-y-0 right-0 z-20 flex flex-col overflow-hidden bg-card shadow-[-8px_0_20px_rgba(0,0,0,0.4)] transition-[width] duration-300 ease-in-out ${
            expanded ? "w-[calc(100%-6rem)]" : "w-24"
          }`}
        >
          {expanded ? (
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              {WEEKDAY_SHORT_LABELS.map((label, index) => (
                <div
                  key={label}
                  ref={(el) => {
                    dayRefs.current[index] = el;
                  }}
                >
                  <DayRow
                    label={label}
                    date={addDaysISO(selectedWeekStart, index)}
                    shifts={shiftsByWeekday[index]}
                    colorByAppId={colorByAppId}
                    apps={apps}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {WEEKDAY_SHORT_LABELS.map((label, index) => {
                const date = addDaysISO(selectedWeekStart, index);
                const dayShifts = shiftsByWeekday[index];
                const dayTotal = dayShifts.reduce((sum, shift) => sum + shift.earnings, 0);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleTapCompactDay(index)}
                    className="flex min-h-[8rem] w-full items-stretch border-b border-border text-left last:border-b-0"
                  >
                    <DayLabelBlock
                      label={label}
                      date={date}
                      dayTotal={dayTotal}
                      hasShifts={dayShifts.length > 0}
                      className="w-full"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card/40 px-4 py-3">
        <span className="text-base font-semibold text-foreground">
          {formatWeekRangeTitle(selectedWeekStart, addDaysISO(selectedWeekStart, 6))}
        </span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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

"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";

import { addDaysISO, getWeekMonthGroup, type DateApp } from "@/lib/utils/aggregate";
import { formatMonthYear } from "@/lib/utils/format";

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekCalendarProps {
  weekStarts: string[];
  selectedWeekStart: string;
  onSelectWeek: (weekStart: string) => void;
  appsByDate: Record<string, DateApp[]>;
  colorByAppId: Map<number, string>;
}

export function WeekCalendar({
  weekStarts,
  selectedWeekStart,
  onSelectWeek,
  appsByDate,
  colorByAppId,
}: WeekCalendarProps) {
  const selectedRowRef = useRef<HTMLButtonElement>(null);

  const monthGroups = useMemo(() => weekStarts.map(getWeekMonthGroup), [weekStarts]);

  useEffect(() => {
    // Only on mount: bring the initially-selected week into view (the list
    // can extend past it to finish out the current month), then leave the
    // user's scroll position alone.
    selectedRowRef.current?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-card text-center text-[10px] font-medium text-muted-foreground">
        {WEEKDAY_SHORT.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      {weekStarts.map((weekStart, index) => {
        const isSelected = weekStart === selectedWeekStart;
        const dates = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
        const group = monthGroups[index];
        const previousGroup = index > 0 ? monthGroups[index - 1] : null;
        const isNewMonth =
          !previousGroup || previousGroup.year !== group.year || previousGroup.month !== group.month;

        return (
          <Fragment key={weekStart}>
            {isNewMonth ? (
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">
                {formatMonthYear(group.year, group.month)}
              </p>
            ) : null}
            <button
              type="button"
              ref={isSelected ? selectedRowRef : undefined}
              onClick={() => onSelectWeek(weekStart)}
              className={`grid w-full grid-cols-7 border-b border-border py-1.5 text-center ${
                isSelected ? "bg-primary/15 ring-1 ring-primary/40 ring-inset" : "hover:bg-secondary"
              }`}
            >
              {dates.map((date) => {
                const isOutsideShownMonth =
                  Number(date.slice(0, 4)) !== group.year || Number(date.slice(5, 7)) !== group.month;

                return (
                  <div key={date} className="flex flex-col items-center gap-0.5">
                    <span
                      className={
                        isOutsideShownMonth ? "text-xs text-muted-foreground/50" : "text-xs text-foreground"
                      }
                    >
                      {Number(date.slice(8, 10))}
                    </span>
                    <div className="flex h-2 items-center gap-0.5">
                      {(appsByDate[date] ?? []).map((app) => (
                        <span
                          key={app.appId}
                          className="h-1.5 w-1.5 rounded-full border border-black"
                          style={{ backgroundColor: colorByAppId.get(app.appId) }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

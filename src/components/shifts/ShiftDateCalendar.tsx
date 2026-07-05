"use client";

import { useMemo, useState } from "react";

import { MonthSpinner } from "@/components/shifts/MonthSpinner";
import { NumberSpinner } from "@/components/ui/NumberSpinner";
import { addDaysISO, getMonthWeekStarts } from "@/lib/utils/aggregate";

const WEEKDAY_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface ShiftDateCalendarProps {
  name: string;
  defaultValue: string;
  label?: string;
}

export function ShiftDateCalendar({ name, defaultValue, label }: ShiftDateCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(defaultValue);
  const [displayYear, setDisplayYear] = useState(Number(defaultValue.slice(0, 4)));
  const [displayMonth, setDisplayMonth] = useState(Number(defaultValue.slice(5, 7)));
  const today = useMemo(() => todayISODate(), []);

  const weekStarts = useMemo(
    () => getMonthWeekStarts(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3">
      <input type="hidden" name={name} value={selectedDate} />

      <div className="flex w-full items-center justify-center gap-4">
        {label ? (
          <span className="text-base font-medium text-secondary-foreground">{label}</span>
        ) : null}
        <MonthSpinner value={displayMonth} onChange={setDisplayMonth} />
        <NumberSpinner
          value={displayYear}
          digits={4}
          ariaLabel="year"
          onIncrement={() => setDisplayYear((year) => year + 1)}
          onDecrement={() => setDisplayYear((year) => year - 1)}
          onCommitText={(parsed) => setDisplayYear(Math.max(1, parsed))}
        />
      </div>

      <div className="grid grid-cols-[repeat(7,2rem)] gap-x-1 text-center text-[10px] font-medium text-muted-foreground">
        {WEEKDAY_SHORT.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {weekStarts.map((weekStart) => (
          <div key={weekStart} className="grid grid-cols-[repeat(7,2rem)] gap-x-1">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDaysISO(weekStart, i);
              const isOutsideMonth =
                Number(date.slice(0, 4)) !== displayYear || Number(date.slice(5, 7)) !== displayMonth;
              const isSelected = date === selectedDate;
              const isToday = date === today;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs hover:bg-secondary ${
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                        ? "text-foreground ring-1 ring-primary/60"
                        : isOutsideMonth
                          ? "text-muted-foreground/50"
                          : "text-foreground"
                  }`}
                >
                  {Number(date.slice(8, 10))}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

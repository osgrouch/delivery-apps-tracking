"use client";

import { NumberSpinner } from "@/components/ui/NumberSpinner";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function wrapRange(value: number, min: number, max: number): number {
  const span = max - min + 1;
  return ((((value - min) % span) + span) % span) + min;
}

interface MonthSpinnerProps {
  value: number;
  onChange: (month: number) => void;
}

/** NumberSpinner displaying/accepting the month by name (typed text is matched by name prefix, falling back to a plain number). */
export function MonthSpinner({ value, onChange }: MonthSpinnerProps) {
  return (
    <NumberSpinner
      value={value}
      ariaLabel="month"
      widthCh={10}
      onIncrement={() => onChange(wrapRange(value + 1, 1, 12))}
      onDecrement={() => onChange(wrapRange(value - 1, 1, 12))}
      onCommitText={onChange}
      formatValue={(month) => MONTH_NAMES[month - 1]}
      parseText={(text) => {
        const trimmed = text.trim().toLowerCase();
        const matchIndex = MONTH_NAMES.findIndex((name) => name.toLowerCase().startsWith(trimmed));
        if (matchIndex !== -1) return matchIndex + 1;

        const asNumber = Number(trimmed);
        return trimmed !== "" && Number.isFinite(asNumber) ? wrapRange(Math.trunc(asNumber), 1, 12) : null;
      }}
    />
  );
}

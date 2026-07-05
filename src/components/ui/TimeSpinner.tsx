"use client";

import { useState } from "react";

import { NumberSpinner } from "@/components/ui/NumberSpinner";

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

interface TimeSpinnerProps {
  name: string;
  defaultValue: string;
}

/** Custom "HH:MM" time picker: arrows or direct text entry adjust the hour and minute, each wrapping around. */
export function TimeSpinner({ name, defaultValue }: TimeSpinnerProps) {
  const [hour, setHour] = useState(() => Number(defaultValue.slice(0, 2)));
  const [minute, setMinute] = useState(() => Number(defaultValue.slice(3, 5)));

  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-1.5">
      <input type="hidden" name={name} value={value} />
      <NumberSpinner
        value={hour}
        ariaLabel="hour"
        onIncrement={() => setHour(wrap(hour + 1, 24))}
        onDecrement={() => setHour(wrap(hour - 1, 24))}
        onCommitText={(parsed) => setHour(wrap(parsed, 24))}
      />
      <span className="text-lg font-semibold text-muted-foreground">:</span>
      <NumberSpinner
        value={minute}
        ariaLabel="minute"
        onIncrement={() => setMinute(wrap(minute + 1, 60))}
        onDecrement={() => setMinute(wrap(minute - 1, 60))}
        onCommitText={(parsed) => setMinute(wrap(parsed, 60))}
      />
    </div>
  );
}

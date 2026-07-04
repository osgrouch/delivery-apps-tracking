import { deriveShiftMetrics } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { ShiftWithApp } from "@/types/database.types";

export function ShiftCard({ shift, color }: { shift: ShiftWithApp; color: string }) {
  const { dollarsPerHour, dollarsPerMile, dollarsPerTrip } = deriveShiftMetrics(shift);

  return (
    <div
      className="flex h-full w-52 shrink-0 flex-col overflow-hidden rounded-lg border-2 shadow-sm"
      style={{ borderColor: color }}
    >
      <div
        className="flex h-[20%] shrink-0 items-center justify-center px-2 text-center text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {shift.app.name}
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 bg-white px-3 py-2 text-xs dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
          <span>
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
          </span>
          <span>{formatNumber(shift.hours)}h</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
          <span>{formatCurrency(shift.earnings)}</span>
          <span>{formatCurrency(dollarsPerHour)}/hr</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
          <span>{formatNumber(shift.mileage)} mi</span>
          <span>{formatCurrency(dollarsPerMile)}/mi</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
          <span>
            {shift.trips} trip{shift.trips === 1 ? "" : "s"}
          </span>
          <span>{formatCurrency(dollarsPerTrip)}/trip</span>
        </div>
      </div>
    </div>
  );
}

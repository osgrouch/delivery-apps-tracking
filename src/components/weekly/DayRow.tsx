import { ShiftCard } from "@/components/weekly/ShiftCard";
import { formatShortDate } from "@/lib/utils/format";
import type { ShiftWithApp } from "@/types/database.types";

interface DayRowProps {
  label: string;
  date: string;
  shifts: ShiftWithApp[];
  colorByAppId: Map<number, string>;
}

export function DayRow({ label, date, shifts, colorByAppId }: DayRowProps) {
  return (
    <div className="flex h-40 shrink-0 items-stretch border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
      <div className="flex w-24 shrink-0 flex-col justify-center border-r border-zinc-200 px-3 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{label}</span>
        <span className="text-xs text-zinc-400">{formatShortDate(date)}</span>
      </div>
      <div className="flex flex-1 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-3 py-2">
        {shifts.length === 0 ? (
          <span className="text-xs text-zinc-400">No shifts</span>
        ) : (
          shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} color={colorByAppId.get(shift.app.id) ?? "#71717a"} />
          ))
        )}
      </div>
    </div>
  );
}

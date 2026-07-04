import { ShiftCard } from "@/components/weekly/ShiftCard";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import type { ShiftWithApp } from "@/types/database.types";

interface DayRowProps {
  label: string;
  date: string;
  shifts: ShiftWithApp[];
  colorByAppId: Map<number, string>;
}

export function DayRow({ label, date, shifts, colorByAppId }: DayRowProps) {
  const dayTotal = shifts.reduce((sum, shift) => sum + shift.earnings, 0);

  return (
    <div className="flex min-h-[8rem] items-stretch border-b border-border last:border-b-0">
      <div className="flex w-24 shrink-0 flex-col justify-center gap-0.5 border-r border-border px-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{formatShortDate(date)}</span>
        {shifts.length > 0 ? (
          <span className="mt-1 font-mono text-xs font-medium text-primary">
            {formatCurrency(dayTotal)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 items-center gap-4 overflow-x-auto overflow-y-hidden px-3 py-4">
        {shifts.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">No shifts logged</span>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              color={colorByAppId.get(shift.app.id) ?? "#71717a"}
            />
          ))
        )}
      </div>
    </div>
  );
}

import { DayLabelBlock } from "@/components/weekly/DayLabelBlock";
import { ShiftCard } from "@/components/weekly/ShiftCard";
import type { App, ShiftWithApp } from "@/types/database.types";

interface DayRowProps {
  label: string;
  date: string;
  shifts: ShiftWithApp[];
  colorByAppId: Map<number, string>;
  apps: App[];
}

export function DayRow({ label, date, shifts, colorByAppId, apps }: DayRowProps) {
  const dayTotal = shifts.reduce((sum, shift) => sum + shift.earnings, 0);

  return (
    <div className="flex min-h-[8rem] items-stretch border-b border-border last:border-b-0">
      <DayLabelBlock
        label={label}
        date={date}
        dayTotal={dayTotal}
        hasShifts={shifts.length > 0}
        className="w-24 shrink-0 border-r border-border"
      />
      <div className="flex flex-1 items-center gap-4 overflow-x-auto overflow-y-hidden px-3 py-4">
        {shifts.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">No shifts logged</span>
        ) : (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              color={colorByAppId.get(shift.app.id) ?? "#71717a"}
              apps={apps}
            />
          ))
        )}
      </div>
    </div>
  );
}

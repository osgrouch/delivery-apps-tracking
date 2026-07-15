import { formatCurrency, formatShortDate } from "@/lib/utils/format";

interface DayLabelBlockProps {
  label: string;
  date: string;
  dayTotal: number;
  hasShifts: boolean;
  className?: string;
}

/** Weekday/date/day-total block shared by DayRow (desktop + mobile-expanded) and the mobile compact day list. */
export function DayLabelBlock({ label, date, dayTotal, hasShifts, className = "" }: DayLabelBlockProps) {
  return (
    <div className={`flex flex-col justify-center gap-0.5 px-3 ${className}`}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="font-mono text-xs text-muted-foreground">{formatShortDate(date)}</span>
      {hasShifts ? (
        <span className="mt-1 font-mono text-xs font-medium text-green-500">{formatCurrency(dayTotal)}</span>
      ) : null}
    </div>
  );
}

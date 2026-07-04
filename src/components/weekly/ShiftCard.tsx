import { Clock, MapPin, Package } from "lucide-react";
import type { ElementType } from "react";

import { deriveShiftMetrics } from "@/lib/utils/aggregate";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils/format";
import type { ShiftWithApp } from "@/types/database.types";

interface StatCellProps {
  label: string;
  value: string;
  icon: ElementType;
  sub: string;
}

function StatCell({ label, value, icon: Icon, sub }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/5 bg-secondary/60 px-3 py-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={11} strokeWidth={2} />
        <span className="text-[10px] font-medium tracking-widest uppercase">{label}</span>
      </div>
      <span className="font-mono text-lg leading-none font-medium whitespace-nowrap text-foreground">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

interface ShiftCardProps {
  shift: ShiftWithApp;
  color: string;
}

export function ShiftCard({ shift, color }: ShiftCardProps) {
  const { dollarsPerHour, dollarsPerMile, dollarsPerTrip } = deriveShiftMetrics(shift);
  const durationLabel = formatDuration(shift.hours);

  return (
    <div
      className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="text-base font-semibold text-foreground">{shift.app.name}</span>
        <span className="font-mono text-sm text-muted-foreground">
          {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
        </span>
      </div>

      <div className="mb-4 px-5">
        <div className="mb-1 text-xs tracking-widest text-muted-foreground uppercase">Total Earned</div>
        <div className="flex items-end gap-2">
          <span className="font-mono text-4xl leading-none font-medium text-foreground">
            {formatCurrency(shift.earnings)}
          </span>
          <span className="mb-0.5 text-sm font-medium" style={{ color }}>
            {durationLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pb-5">
        <StatCell label="Hours" value={durationLabel} icon={Clock} sub={`${formatCurrency(dollarsPerHour)}/hr`} />
        <StatCell
          label="Miles"
          value={formatNumber(shift.mileage)}
          icon={MapPin}
          sub={`${formatCurrency(dollarsPerMile)}/mi`}
        />
        <StatCell
          label="Trips"
          value={String(shift.trips)}
          icon={Package}
          sub={`${formatCurrency(dollarsPerTrip)}/trip`}
        />
      </div>
    </div>
  );
}

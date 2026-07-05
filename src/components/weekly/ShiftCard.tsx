import { Clock, MapPin, Package } from "lucide-react";
import type { ElementType } from "react";

import { EditShiftModal } from "@/components/shifts/EditShiftModal";
import { deriveShiftMetrics } from "@/lib/utils/aggregate";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

interface StatCellProps {
  label: string;
  value: string;
  icon: ElementType;
  sub: string;
}

function StatCell({ label, value, icon: Icon, sub }: StatCellProps) {
  return (
    <div className="flex flex-col gap-[3px] border border-white/5 bg-secondary/60 px-[10px] py-[5px]">
      <div className="flex items-center gap-[5px] text-muted-foreground">
        <Icon size={9} strokeWidth={2} />
        <span className="text-[8.5px] font-medium tracking-widest uppercase">{label}</span>
      </div>
      <span className="font-mono text-[15px] leading-none font-normal whitespace-nowrap text-foreground">
        {value}
      </span>
      <span className="mt-[2px] text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}

interface ShiftCardProps {
  shift: ShiftWithApp;
  color: string;
  apps: App[];
}

export function ShiftCard({ shift, color, apps }: ShiftCardProps) {
  const { dollarsPerHour, dollarsPerMile, dollarsPerTrip } = deriveShiftMetrics(shift);
  const durationLabel = formatDuration(shift.hours);

  return (
    <div
      className="flex w-[323px] shrink-0 flex-col overflow-hidden border-2 bg-card shadow-[0_3px_20px_rgba(0,0,0,0.4)]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between px-[17px] pt-[17px] pb-[14px]">
        <span className="text-[14px] font-semibold text-foreground">{shift.app.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-muted-foreground">
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
          </span>
          <EditShiftModal shift={shift} apps={apps} />
        </div>
      </div>

      <div className="mb-[14px] px-[17px]">
        <div className="mb-[3px] text-[10px] tracking-widest text-muted-foreground uppercase">Total Earned</div>
        <div className="flex items-end gap-[7px]">
          <span className="font-mono text-[31px] leading-none font-medium text-foreground">
            {formatCurrency(shift.earnings)}
          </span>
          <span className="mb-[2px] text-[12px] font-medium" style={{ color }}>
            {durationLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[7px] px-[17px] pb-[17px]">
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

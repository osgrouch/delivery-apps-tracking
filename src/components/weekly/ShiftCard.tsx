import { Clock, MapPin, Package } from "lucide-react";

import { EditShiftModal } from "@/components/shifts/EditShiftModal";
import { StatCell } from "@/components/ui/StatCell";
import { deriveShiftMetrics } from "@/lib/utils/aggregate";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

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
      className="flex w-[258px] shrink-0 flex-col overflow-hidden border-2 bg-card shadow-[0_3px_20px_rgba(0,0,0,0.4)] md:w-[323px]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between px-[14px] pt-[14px] pb-[11px] md:px-[17px] md:pt-[17px] md:pb-[14px]">
        <span className="text-[11px] font-semibold text-foreground md:text-[14px]">{shift.app.name}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground md:text-[12px]">
            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
          </span>
          <EditShiftModal shift={shift} apps={apps} />
        </div>
      </div>

      <div className="mb-[11px] px-[14px] md:mb-[14px] md:px-[17px]">
        <div className="mb-[2px] text-[8px] tracking-widest text-muted-foreground uppercase md:mb-[3px] md:text-[10px]">
          Total Earned
        </div>
        <div className="flex items-end gap-[6px] md:gap-[7px]">
          <span className="font-mono text-[25px] leading-none font-medium text-foreground md:text-[31px]">
            {formatCurrency(shift.earnings)}
          </span>
          <span className="mb-[2px] text-[10px] font-medium md:text-[12px]" style={{ color }}>
            {durationLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[6px] px-[14px] pb-[14px] md:gap-[7px] md:px-[17px] md:pb-[17px]">
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

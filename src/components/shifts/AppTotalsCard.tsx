import { Clock, MapPin, Package } from "lucide-react";

import { StatCell } from "@/components/ui/StatCell";
import type { AppTotals } from "@/lib/utils/aggregate";
import { formatCurrency, formatDuration, formatNumber } from "@/lib/utils/format";

export function AppTotalsCard({ totals, color }: { totals: AppTotals; color: string }) {
  const durationLabel = formatDuration(totals.totalHours);

  return (
    <div
      className="flex w-[323px] shrink-0 flex-col overflow-hidden border-2 bg-card shadow-[0_3px_20px_rgba(0,0,0,0.4)]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center justify-between px-[17px] pt-[17px] pb-[14px]">
        <span className="text-[14px] font-semibold text-foreground">{totals.appName}</span>
        <span className="font-mono text-[12px] text-muted-foreground">
          {totals.shiftCount} shift{totals.shiftCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mb-[14px] px-[17px]">
        <div className="mb-[3px] text-[10px] tracking-widest text-muted-foreground uppercase">All-Time Earned</div>
        <div className="flex items-end gap-[7px]">
          <span className="font-mono text-[31px] leading-none font-medium text-foreground">
            {formatCurrency(totals.totalEarnings)}
          </span>
          <span className="mb-[2px] text-[12px] font-medium" style={{ color }}>
            {durationLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[7px] px-[17px] pb-[17px]">
        <StatCell
          label="Hours"
          value={durationLabel}
          icon={Clock}
          sub={`${formatCurrency(totals.avgDollarsPerHour)}/hr`}
        />
        <StatCell
          label="Miles"
          value={formatNumber(totals.totalMileage)}
          icon={MapPin}
          sub={`${formatCurrency(totals.avgDollarsPerMile)}/mi`}
        />
        <StatCell
          label="Trips"
          value={String(totals.totalTrips)}
          icon={Package}
          sub={`${formatCurrency(totals.avgDollarsPerTrip)}/trip`}
        />
      </div>
    </div>
  );
}

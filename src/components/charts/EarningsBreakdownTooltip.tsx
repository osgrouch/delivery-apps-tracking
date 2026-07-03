import type { AppBreakdown } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

interface EarningsBreakdownTooltipProps {
  header: string;
  byApp: AppBreakdown[];
  totalEarnings: number;
  totalHours: number;
  avgDollarsPerHour: number;
  colorByAppId: Map<number, string>;
}

/** Shared tooltip body for the weekly and monthly earnings-by-app charts. */
export function EarningsBreakdownTooltip({
  header,
  byApp,
  totalEarnings,
  totalHours,
  avgDollarsPerHour,
  colorByAppId,
}: EarningsBreakdownTooltipProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-xs shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">{header}</p>
      <div className="flex flex-col gap-1">
        {byApp.map((app) => (
          <div key={app.appId} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colorByAppId.get(app.appId) }}
              />
              {app.appName}
            </span>
            <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {formatCurrency(app.earnings)} · {formatNumber(app.hours)}h ·{" "}
              {formatCurrency(app.dollarsPerHour)}/hr
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-zinc-200 pt-2 font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
        <span>Total</span>
        <span className="tabular-nums">
          {formatCurrency(totalEarnings)} · {formatNumber(totalHours)}h ·{" "}
          {formatCurrency(avgDollarsPerHour)}/hr
        </span>
      </div>
    </div>
  );
}

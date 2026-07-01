import { AppBreakdownChart } from "@/components/charts/AppBreakdownChart";
import { EarningsOverTimeChart } from "@/components/charts/EarningsOverTimeChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { getShifts } from "@/lib/queries/shifts";
import { aggregateByApp, aggregateByDate, computeTotals } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export default async function DashboardPage() {
  const shifts = await getShifts();
  const totals = computeTotals(shifts);
  const earningsByDate = aggregateByDate(shifts);
  const earningsByApp = aggregateByApp(shifts);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totals.shiftCount} shift{totals.shiftCount === 1 ? "" : "s"} logged
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Total earnings" value={formatCurrency(totals.totalEarnings)} />
        <KpiCard label="Total hours" value={formatNumber(totals.totalHours)} />
        <KpiCard label="Total miles" value={formatNumber(totals.totalMileage)} />
        <KpiCard label="Total trips" value={totals.totalTrips.toString()} />
        <KpiCard label="$ / hour" value={formatCurrency(totals.avgDollarsPerHour)} />
        <KpiCard label="$ / mile" value={formatCurrency(totals.avgDollarsPerMile)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Earnings over time
          </h2>
          <EarningsOverTimeChart data={earningsByDate} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Earnings by app
          </h2>
          <AppBreakdownChart data={earningsByApp} />
        </div>
      </div>
    </div>
  );
}

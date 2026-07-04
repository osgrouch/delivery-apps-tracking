import { AppBreakdownChart } from "@/components/charts/AppBreakdownChart";
import { EarningsOverTimeChart } from "@/components/charts/EarningsOverTimeChart";
import { MonthlyEarningsChart } from "@/components/charts/MonthlyEarningsChart";
import { WeeklyEarningsChart } from "@/components/charts/WeeklyEarningsChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { getApps, getShifts } from "@/lib/queries/shifts";
import {
  aggregateByApp,
  aggregateByDate,
  aggregateWeekByApp,
  aggregateYearByApp,
  computeTotals,
  getMondayOfWeek,
  getYearRange,
} from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const [shifts, apps] = await Promise.all([getShifts(), getApps()]);
  const totals = computeTotals(shifts);
  const earningsByDate = aggregateByDate(shifts);
  const earningsByApp = aggregateByApp(shifts);

  const today = todayISODate();
  const currentYear = Number(today.slice(0, 4));

  const weekStart = getMondayOfWeek(today);
  const weeklyEarnings = aggregateWeekByApp(shifts, apps, weekStart);

  const monthlyEarnings = aggregateYearByApp(shifts, apps, currentYear);
  const yearRange = getYearRange(shifts) ?? { minYear: currentYear, maxYear: currentYear };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
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
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-secondary-foreground">
            Earnings over time
          </h2>
          <EarningsOverTimeChart data={earningsByDate} />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-secondary-foreground">
            Earnings by app
          </h2>
          <AppBreakdownChart data={earningsByApp} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <WeeklyEarningsChart apps={apps} initialWeekStart={weekStart} initialData={weeklyEarnings} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <MonthlyEarningsChart
          apps={apps}
          initialYear={currentYear}
          initialData={monthlyEarnings}
          minYear={yearRange.minYear}
          maxYear={yearRange.maxYear}
        />
      </div>
    </div>
  );
}

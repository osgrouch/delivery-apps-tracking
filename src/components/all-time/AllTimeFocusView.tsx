import { AllTimeShiftTable } from "@/components/all-time/AllTimeShiftTable";
import { AppTotalsCard } from "@/components/shifts/AppTotalsCard";
import { MonthlyEarningsChart } from "@/components/charts/MonthlyEarningsChart";
import type { AppTotals, DashboardTotals, MonthlyEarnings } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

interface AllTimeFocusViewProps {
  apps: App[];
  shifts: ShiftWithApp[];
  totalsByApp: AppTotals[];
  allTimeTotals: DashboardTotals;
  initialYear: number;
  initialMonthlyData: MonthlyEarnings[];
  minYear: number;
  maxYear: number;
}

export function AllTimeFocusView({
  apps,
  shifts,
  totalsByApp,
  allTimeTotals,
  initialYear,
  initialMonthlyData,
  minYear,
  maxYear,
}: AllTimeFocusViewProps) {
  const colorByAppId = new Map(apps.map((app) => [app.id, app.color]));

  const footerItems = [
    { label: "All Time Total", value: formatCurrency(allTimeTotals.totalEarnings) },
    { label: "Total Miles", value: `${formatNumber(allTimeTotals.totalMileage)} mi` },
    { label: "Total Trips", value: allTimeTotals.totalTrips.toString() },
    { label: "Total Hours", value: `${formatNumber(allTimeTotals.totalHours)}h` },
    { label: "Avg $/Hour", value: formatCurrency(allTimeTotals.avgDollarsPerHour) },
    { label: "Avg $/Mile", value: formatCurrency(allTimeTotals.avgDollarsPerMile) },
  ];

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto] overflow-hidden">
      <div className="grid min-h-0 grid-cols-[30%_70%] overflow-hidden">
        <div className="grid min-h-0 grid-rows-[45%_55%] border-r border-border">
          <div className="min-h-0 overflow-hidden border-b border-border p-4">
            <MonthlyEarningsChart
              apps={apps}
              initialYear={initialYear}
              initialData={initialMonthlyData}
              minYear={minYear}
              maxYear={maxYear}
              yearControl="spinner"
              height="100%"
            />
          </div>

          <div className="flex min-h-0 flex-col gap-2 overflow-hidden p-4">
            <h2 className="text-sm font-medium text-secondary-foreground">All Time Stats</h2>
            <div className="flex flex-1 flex-col items-center gap-4 overflow-auto">
              {totalsByApp.map((totals) => (
                <AppTotalsCard
                  key={totals.appId}
                  totals={totals}
                  color={colorByAppId.get(totals.appId) ?? "#64748b"}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0">
          <AllTimeShiftTable shifts={shifts} apps={apps} colorByAppId={colorByAppId} />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-[30%_70%] border-t border-border bg-card/40">
        <div className="flex items-center justify-center border-r border-border px-6 py-3">
          <span className="text-lg font-semibold text-foreground">All Time</span>
        </div>
        <div className="flex flex-wrap items-center gap-8 px-6 py-3">
          {footerItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {item.label}
              </span>
              <span className="font-mono text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

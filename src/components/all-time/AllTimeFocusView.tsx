"use client";

import { AllTimeFocusViewMobile } from "@/components/all-time/AllTimeFocusViewMobile";
import { AllTimeShiftTable } from "@/components/all-time/AllTimeShiftTable";
import { useAllTimeFocusData } from "@/components/all-time/useAllTimeFocusData";
import { MonthlyEarningsChart } from "@/components/charts/MonthlyEarningsChart";
import { AppTotalsCard } from "@/components/shifts/AppTotalsCard";
import type { AppTotals, MonthlyEarnings } from "@/lib/utils/aggregate";
import type { App, Location, ShiftWithApp } from "@/types/database.types";

interface AllTimeFocusViewProps {
  apps: App[];
  locations: Location[];
  shifts: ShiftWithApp[];
  totalsByApp: AppTotals[];
  initialYear: number;
  initialMonthlyData: MonthlyEarnings[];
  minYear: number;
  maxYear: number;
}

export function AllTimeFocusView({
  apps,
  locations,
  shifts,
  totalsByApp,
  initialYear,
  initialMonthlyData,
  minYear,
  maxYear,
}: AllTimeFocusViewProps) {
  const {
    colorByAppId,
    appFilter,
    setAppFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    sortOption,
    setSortOption,
    visibleShifts,
    footerItems,
    footerTitle,
  } = useAllTimeFocusData({ apps, shifts });

  return (
    <>
      <div className="hidden h-full w-full grid-rows-[1fr_auto] overflow-hidden md:grid">
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
            <AllTimeShiftTable
              visibleShifts={visibleShifts}
              apps={apps}
              locations={locations}
              colorByAppId={colorByAppId}
              appFilter={appFilter}
              setAppFilter={setAppFilter}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-[30%_70%] border-t border-border bg-card/40">
          <div className="flex items-center justify-center border-r border-border px-6 py-3">
            <span className="text-center text-lg font-semibold text-foreground">{footerTitle}</span>
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

      <AllTimeFocusViewMobile
        apps={apps}
        locations={locations}
        totalsByApp={totalsByApp}
        colorByAppId={colorByAppId}
        initialYear={initialYear}
        initialMonthlyData={initialMonthlyData}
        minYear={minYear}
        maxYear={maxYear}
        footerItems={footerItems}
        footerTitle={footerTitle}
        visibleShifts={visibleShifts}
        appFilter={appFilter}
        setAppFilter={setAppFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
    </>
  );
}

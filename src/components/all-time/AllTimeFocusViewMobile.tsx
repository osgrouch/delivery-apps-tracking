"use client";

import { useEffect, useRef, useState } from "react";

import { AllTimeShiftTable } from "@/components/all-time/AllTimeShiftTable";
import type { AllTimeFooterItem, SortOption } from "@/components/all-time/useAllTimeFocusData";
import { MonthlyEarningsChart } from "@/components/charts/MonthlyEarningsChart";
import { AppTotalsCard } from "@/components/shifts/AppTotalsCard";
import type { AppTotals, MonthlyEarnings } from "@/lib/utils/aggregate";
import type { App, Location, ShiftWithApp } from "@/types/database.types";

interface AllTimeFocusViewMobileProps {
  apps: App[];
  locations: Location[];
  totalsByApp: AppTotals[];
  colorByAppId: Map<number, string>;
  initialYear: number;
  initialMonthlyData: MonthlyEarnings[];
  minYear: number;
  maxYear: number;
  footerItems: AllTimeFooterItem[];
  footerTitle: string;
  visibleShifts: ShiftWithApp[];
  appFilter: "all" | number;
  setAppFilter: (value: "all" | number) => void;
  locationFilter: "all" | number;
  setLocationFilter: (value: "all" | number) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
}

/**
 * Mobile-only /all-time layout, mirroring WeeklyFocusViewMobile: the chart
 * and app-totals cards render at full width as a background layer, and the
 * shift table is a right-docked drawer toggling between a compact "Shifts"
 * tab and the expanded, filterable table. See useAllTimeFocusData for the
 * shared filter/sort state this consumes (also used by the desktop tree in
 * AllTimeFocusView.tsx).
 */
export function AllTimeFocusViewMobile({
  apps,
  locations,
  totalsByApp,
  colorByAppId,
  initialYear,
  initialMonthlyData,
  minYear,
  maxYear,
  footerItems,
  footerTitle,
  visibleShifts,
  appFilter,
  setAppFilter,
  locationFilter,
  setLocationFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sortOption,
  setSortOption,
}: AllTimeFocusViewMobileProps) {
  const [expanded, setExpanded] = useState(false);
  const [tableInteractive, setTableInteractive] = useState(false);
  const interactiveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (interactiveTimeoutRef.current) clearTimeout(interactiveTimeoutRef.current);
    };
  }, []);

  function handleExpand() {
    setExpanded(true);
    if (interactiveTimeoutRef.current) clearTimeout(interactiveTimeoutRef.current);
    interactiveTimeoutRef.current = setTimeout(() => setTableInteractive(true), 500);
  }

  function handleCollapse() {
    setExpanded(false);
    setTableInteractive(false);
    if (interactiveTimeoutRef.current) clearTimeout(interactiveTimeoutRef.current);
  }

  return (
    <div className="flex h-full w-full flex-col md:hidden">
      <div className="relative min-h-0 flex-1">
        <div className="mr-24 grid h-full grid-rows-[45%_55%]">
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

        {expanded ? (
          <button
            type="button"
            onClick={handleCollapse}
            aria-label="Collapse shift list and show chart and app totals"
            className="absolute inset-y-0 left-0 z-10 w-24"
          />
        ) : null}

        <div
          className={`absolute inset-y-0 right-0 z-20 flex flex-col overflow-hidden bg-card shadow-[-8px_0_20px_rgba(0,0,0,0.4)] transition-[width] duration-500 ease-in-out ${
            expanded ? "w-[calc(100%-6rem)]" : "w-24"
          }`}
        >
          <div
            className={`min-h-0 flex-1 transition-opacity duration-500 ease-in-out ${
              expanded ? "opacity-100" : "opacity-0"
            } ${tableInteractive ? "" : "pointer-events-none"}`}
          >
            <AllTimeShiftTable
              visibleShifts={visibleShifts}
              apps={apps}
              locations={locations}
              colorByAppId={colorByAppId}
              appFilter={appFilter}
              setAppFilter={setAppFilter}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          </div>

          <button
            type="button"
            onClick={handleExpand}
            aria-label="Expand shift list"
            tabIndex={expanded ? -1 : 0}
            className={`absolute inset-0 flex flex-col items-center justify-center gap-8 transition-opacity duration-500 ease-in-out ${
              expanded ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <span className="-rotate-90 text-sm font-medium tracking-widest whitespace-nowrap text-foreground">
              Shifts
            </span>
            <span className="font-mono text-sm text-muted-foreground">{visibleShifts.length}</span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-card/40 px-4 py-3">
        <span className="text-base font-semibold text-foreground">{footerTitle}</span>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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

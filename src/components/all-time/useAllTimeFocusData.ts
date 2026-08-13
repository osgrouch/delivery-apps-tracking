"use client";

import { useMemo, useState } from "react";

import { computeTotals, type DashboardTotals } from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber, formatShortDate, formatShortDateWithYear } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

export type SortOption =
  | "date-desc"
  | "date-asc"
  | "earnings-desc"
  | "earnings-asc"
  | "hours-desc"
  | "hours-asc"
  | "miles-desc"
  | "miles-asc"
  | "trips-desc"
  | "trips-asc";

export const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Date (Newest first)",
  "date-asc": "Date (Oldest first)",
  "earnings-desc": "Earnings (High to Low)",
  "earnings-asc": "Earnings (Low to High)",
  "hours-desc": "Hours (High to Low)",
  "hours-asc": "Hours (Low to High)",
  "miles-desc": "Miles (High to Low)",
  "miles-asc": "Miles (Low to High)",
  "trips-desc": "Trips (High to Low)",
  "trips-asc": "Trips (Low to High)",
};

const SORT_COMPARATORS: Record<SortOption, (a: ShiftWithApp, b: ShiftWithApp) => number> = {
  "date-desc": (a, b) => b.date.localeCompare(a.date),
  "date-asc": (a, b) => a.date.localeCompare(b.date),
  "earnings-desc": (a, b) => b.earnings - a.earnings,
  "earnings-asc": (a, b) => a.earnings - b.earnings,
  "hours-desc": (a, b) => b.hours - a.hours,
  "hours-asc": (a, b) => a.hours - b.hours,
  "miles-desc": (a, b) => b.mileage - a.mileage,
  "miles-asc": (a, b) => a.mileage - b.mileage,
  "trips-desc": (a, b) => b.trips - a.trips,
  "trips-asc": (a, b) => a.trips - b.trips,
};

interface UseAllTimeFocusDataArgs {
  apps: App[];
  shifts: ShiftWithApp[];
}

export interface AllTimeFooterItem {
  label: string;
  value: string;
}

interface UseAllTimeFocusDataResult {
  colorByAppId: Map<number, string>;
  appFilter: "all" | number;
  setAppFilter: (value: "all" | number) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
  visibleShifts: ShiftWithApp[];
  visibleTotals: DashboardTotals;
  footerItems: AllTimeFooterItem[];
  footerTitle: string;
}

/** Shared filter/sort state and derived table/footer data for both the desktop and mobile /all-time trees. */
export function useAllTimeFocusData({ apps, shifts }: UseAllTimeFocusDataArgs): UseAllTimeFocusDataResult {
  const colorByAppId = useMemo(() => new Map(apps.map((app) => [app.id, app.color])), [apps]);

  const [appFilter, setAppFilter] = useState<"all" | number>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  const visibleShifts = useMemo(() => {
    const filtered = shifts.filter((shift) => {
      if (appFilter !== "all" && shift.app.id !== appFilter) return false;
      if (fromDate && shift.date < fromDate) return false;
      if (toDate && shift.date > toDate) return false;
      return true;
    });
    return filtered.sort(SORT_COMPARATORS[sortOption]);
  }, [shifts, appFilter, fromDate, toDate, sortOption]);

  const visibleTotals = useMemo(() => computeTotals(visibleShifts), [visibleShifts]);

  const footerTitle = useMemo(() => {
    const hasDateFilter = Boolean(fromDate || toDate);

    if (appFilter === "all") {
      return hasDateFilter ? "All Apps" : "All Time";
    }

    const appLabel = apps.find((app) => app.id === appFilter)?.name ?? "All Apps";
    if (!hasDateFilter) return appLabel;

    const spansYears = fromDate && toDate && fromDate.slice(0, 4) !== toDate.slice(0, 4);
    const formatRangeDate = spansYears ? formatShortDateWithYear : formatShortDate;
    const dateLabel =
      fromDate && toDate
        ? `${formatRangeDate(fromDate)} – ${formatRangeDate(toDate)}`
        : fromDate
          ? `From ${formatRangeDate(fromDate)}`
          : `Through ${formatRangeDate(toDate)}`;
    return `${appLabel}: ${dateLabel}`;
  }, [apps, appFilter, fromDate, toDate]);

  const footerItems = useMemo(
    () => [
      { label: "Total Earnings", value: formatCurrency(visibleTotals.totalEarnings) },
      { label: "Total Miles", value: `${formatNumber(visibleTotals.totalMileage)} mi` },
      { label: "Total Trips", value: visibleTotals.totalTrips.toString() },
      { label: "Total Hours", value: `${formatNumber(visibleTotals.totalHours)}h` },
      { label: "Avg $/Hour", value: formatCurrency(visibleTotals.avgDollarsPerHour) },
      { label: "Avg $/Mile", value: formatCurrency(visibleTotals.avgDollarsPerMile) },
    ],
    [visibleTotals],
  );

  return {
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
    visibleTotals,
    footerItems,
    footerTitle,
  };
}

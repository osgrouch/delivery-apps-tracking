import { useEffect, useMemo, useRef, useState } from "react";

import {
  computeTotals,
  aggregateWeekByApp,
  groupShiftsByWeekday,
  type DashboardTotals,
  type WeeklyDayEarnings,
} from "@/lib/utils/aggregate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

interface UseWeeklyFocusDataArgs {
  apps: App[];
  shifts: ShiftWithApp[];
  initialWeekStart: string;
}

export interface WeeklyFooterItem {
  label: string;
  value: string;
}

interface UseWeeklyFocusDataResult {
  selectedWeekStart: string;
  isChangingWeek: boolean;
  handleSelectWeek: (weekStart: string) => void;
  colorByAppId: Map<number, string>;
  selectedWeekData: WeeklyDayEarnings[];
  shiftsByWeekday: ShiftWithApp[][];
  weekTotals: DashboardTotals;
  footerItems: WeeklyFooterItem[];
}

/** Shared week-selection state and derived chart/day-row/footer data for both the desktop and mobile /weekly trees. */
export function useWeeklyFocusData({
  apps,
  shifts,
  initialWeekStart,
}: UseWeeklyFocusDataArgs): UseWeeklyFocusDataResult {
  const [selectedWeekStart, setSelectedWeekStart] = useState(initialWeekStart);
  const [isChangingWeek, setIsChangingWeek] = useState(false);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    };
  }, []);

  function handleSelectWeek(weekStart: string) {
    if (weekStart === selectedWeekStart) return;
    setSelectedWeekStart(weekStart);
    setIsChangingWeek(true);
    if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    changeTimeoutRef.current = setTimeout(() => setIsChangingWeek(false), 700);
  }

  const colorByAppId = useMemo(() => new Map(apps.map((app) => [app.id, app.color])), [apps]);

  const selectedWeekData = useMemo(
    () => aggregateWeekByApp(shifts, apps, selectedWeekStart),
    [shifts, apps, selectedWeekStart],
  );

  const shiftsByWeekday = useMemo(
    () => groupShiftsByWeekday(shifts, selectedWeekStart),
    [shifts, selectedWeekStart],
  );

  const selectedWeekShifts = useMemo(() => shiftsByWeekday.flat(), [shiftsByWeekday]);

  const weekTotals = useMemo(() => computeTotals(selectedWeekShifts), [selectedWeekShifts]);

  const footerItems = useMemo(
    () => [
      { label: "Week Total", value: formatCurrency(weekTotals.totalEarnings) },
      { label: "Total Miles", value: `${formatNumber(weekTotals.totalMileage)} mi` },
      { label: "Total Trips", value: weekTotals.totalTrips.toString() },
      { label: "Total Hours", value: `${formatNumber(weekTotals.totalHours)}h` },
      { label: "Avg $/Hour", value: formatCurrency(weekTotals.avgDollarsPerHour) },
      { label: "Avg $/Mile", value: formatCurrency(weekTotals.avgDollarsPerMile) },
    ],
    [weekTotals],
  );

  return {
    selectedWeekStart,
    isChangingWeek,
    handleSelectWeek,
    colorByAppId,
    selectedWeekData,
    shiftsByWeekday,
    weekTotals,
    footerItems,
  };
}

"use server";

import { getApps, getShifts } from "@/lib/queries/shifts";
import {
  addDaysISO,
  aggregateWeeklyTotalsForYear,
  aggregateYearByApp,
  type MonthlyEarnings,
  type WeeklyTotal,
} from "@/lib/utils/aggregate";

/** Re-fetches and re-aggregates one calendar year for the monthly earnings chart. */
export async function getMonthlyEarnings(year: number): Promise<MonthlyEarnings[]> {
  const [shifts, apps] = await Promise.all([
    getShifts({ from: `${year}-01-01`, to: `${year}-12-31` }),
    getApps(),
  ]);

  return aggregateYearByApp(shifts, apps, year);
}

/** Re-fetches and re-aggregates one calendar year of weekly totals for the earnings-over-time chart. */
export async function getEarningsOverTime(year: number): Promise<WeeklyTotal[]> {
  // Widen the fetch range by a week on each side so boundary weeks (whose
  // Monday falls in this year but which spill into Dec/Jan) are fully counted.
  const shifts = await getShifts({
    from: addDaysISO(`${year}-01-01`, -7),
    to: addDaysISO(`${year}-12-31`, 7),
  });

  return aggregateWeeklyTotalsForYear(shifts, year);
}

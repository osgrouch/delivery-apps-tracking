"use server";

import { getApps, getShifts } from "@/lib/queries/shifts";
import {
  addDaysISO,
  aggregateWeekByApp,
  aggregateYearByApp,
  type MonthlyEarnings,
  type WeeklyDayEarnings,
} from "@/lib/utils/aggregate";

/** Re-fetches and re-aggregates one Monday-Sunday week for the weekly earnings chart. */
export async function getWeeklyEarnings(weekStartISO: string): Promise<WeeklyDayEarnings[]> {
  const weekEndISO = addDaysISO(weekStartISO, 6);
  const [shifts, apps] = await Promise.all([
    getShifts({ from: weekStartISO, to: weekEndISO }),
    getApps(),
  ]);

  return aggregateWeekByApp(shifts, apps, weekStartISO);
}

/** Re-fetches and re-aggregates one calendar year for the monthly earnings chart. */
export async function getMonthlyEarnings(year: number): Promise<MonthlyEarnings[]> {
  const [shifts, apps] = await Promise.all([
    getShifts({ from: `${year}-01-01`, to: `${year}-12-31` }),
    getApps(),
  ]);

  return aggregateYearByApp(shifts, apps, year);
}

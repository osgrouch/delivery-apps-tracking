"use server";

import { getApps, getShifts } from "@/lib/queries/shifts";
import { addDaysISO, aggregateWeekByApp, type WeeklyDayEarnings } from "@/lib/utils/aggregate";

/** Re-fetches and re-aggregates one Monday-Sunday week for the weekly earnings chart. */
export async function getWeeklyEarnings(weekStartISO: string): Promise<WeeklyDayEarnings[]> {
  const weekEndISO = addDaysISO(weekStartISO, 6);
  const [shifts, apps] = await Promise.all([
    getShifts({ from: weekStartISO, to: weekEndISO }),
    getApps(),
  ]);

  return aggregateWeekByApp(shifts, apps, weekStartISO);
}

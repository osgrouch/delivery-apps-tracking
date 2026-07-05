import type { App, ShiftWithApp } from "@/types/database.types";

type EarningsShift = Pick<ShiftWithApp, "earnings" | "hours" | "mileage" | "trips">;
type DatedEarningsShift = EarningsShift & Pick<ShiftWithApp, "date">;
type AppEarningsShift = Pick<ShiftWithApp, "earnings" | "hours"> & {
  app: Pick<ShiftWithApp["app"], "name">;
};
type AppDatedShift = Pick<ShiftWithApp, "date" | "earnings" | "hours"> & {
  app: Pick<ShiftWithApp["app"], "id" | "name">;
};

export interface DerivedMetrics {
  dollarsPerHour: number;
  dollarsPerMile: number;
  dollarsPerTrip: number;
}

/** Per-shift rate metrics. Zero denominators yield 0 rather than NaN/Infinity. */
export function deriveShiftMetrics(shift: EarningsShift): DerivedMetrics {
  return {
    dollarsPerHour: shift.hours > 0 ? shift.earnings / shift.hours : 0,
    dollarsPerMile: shift.mileage > 0 ? shift.earnings / shift.mileage : 0,
    dollarsPerTrip: shift.trips > 0 ? shift.earnings / shift.trips : 0,
  };
}

export interface DashboardTotals {
  shiftCount: number;
  totalEarnings: number;
  totalHours: number;
  totalMileage: number;
  totalTrips: number;
  avgDollarsPerHour: number;
  avgDollarsPerMile: number;
  avgDollarsPerTrip: number;
}

/** Sums and blended (not averaged-of-averages) rate metrics across shifts. */
export function computeTotals(shifts: readonly EarningsShift[]): DashboardTotals {
  const totals = shifts.reduce(
    (acc, shift) => {
      acc.totalEarnings += shift.earnings;
      acc.totalHours += shift.hours;
      acc.totalMileage += shift.mileage;
      acc.totalTrips += shift.trips;
      return acc;
    },
    { totalEarnings: 0, totalHours: 0, totalMileage: 0, totalTrips: 0 },
  );

  return {
    shiftCount: shifts.length,
    ...totals,
    avgDollarsPerHour: totals.totalHours > 0 ? totals.totalEarnings / totals.totalHours : 0,
    avgDollarsPerMile: totals.totalMileage > 0 ? totals.totalEarnings / totals.totalMileage : 0,
    avgDollarsPerTrip: totals.totalTrips > 0 ? totals.totalEarnings / totals.totalTrips : 0,
  };
}

export interface EarningsByApp {
  appName: string;
  earnings: number;
  shiftCount: number;
  dollarsPerHour: number;
}

/** Groups shifts by delivery app, sorted descending by total earnings. */
export function aggregateByApp(shifts: readonly AppEarningsShift[]): EarningsByApp[] {
  const byApp = new Map<string, { earnings: number; hours: number; shiftCount: number }>();

  for (const shift of shifts) {
    const key = shift.app.name;
    const existing = byApp.get(key) ?? { earnings: 0, hours: 0, shiftCount: 0 };
    existing.earnings += shift.earnings;
    existing.hours += shift.hours;
    existing.shiftCount += 1;
    byApp.set(key, existing);
  }

  return [...byApp.entries()]
    .map(([appName, totals]) => ({
      appName,
      earnings: totals.earnings,
      shiftCount: totals.shiftCount,
      dollarsPerHour: totals.hours > 0 ? totals.earnings / totals.hours : 0,
    }))
    .sort((a, b) => b.earnings - a.earnings);
}

export interface AppTotals extends DashboardTotals {
  appId: number;
  appName: string;
}

/** Runs computeTotals per app, so every app appears even with zero shifts. */
export function aggregateTotalsByApp(
  shifts: readonly (EarningsShift & { app: Pick<App, "id"> })[],
  apps: readonly Pick<App, "id" | "name">[],
): AppTotals[] {
  const shiftsByApp = new Map<number, EarningsShift[]>(apps.map((app) => [app.id, []]));
  for (const shift of shifts) {
    shiftsByApp.get(shift.app.id)?.push(shift);
  }

  return apps.map((app) => ({
    appId: app.id,
    appName: app.name,
    ...computeTotals(shiftsByApp.get(app.id) ?? []),
  }));
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Monday (ISO date) of the week containing the given date. All arithmetic is UTC-anchored to avoid local-timezone day shifts. */
export function getMondayOfWeek(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Hours between two same-day "HH:MM" times (end must be after start; see shiftFormSchema). */
export function computeHoursFromTimes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

export interface AppBreakdown {
  appId: number;
  appName: string;
  earnings: number;
  hours: number;
  dollarsPerHour: number;
}

export interface WeeklyDayEarnings {
  date: string;
  weekday: string;
  totalEarnings: number;
  totalHours: number;
  avgDollarsPerHour: number;
  byApp: AppBreakdown[];
}

function emptyAppBreakdown(apps: readonly Pick<App, "id" | "name">[]): AppBreakdown[] {
  return apps.map((app) => ({
    appId: app.id,
    appName: app.name,
    earnings: 0,
    hours: 0,
    dollarsPerHour: 0,
  }));
}

function finalizeAppRates(byApp: AppBreakdown[]): void {
  for (const appEntry of byApp) {
    appEntry.dollarsPerHour = appEntry.hours > 0 ? appEntry.earnings / appEntry.hours : 0;
  }
}

/**
 * Builds one entry per day (Monday-Sunday) for the week starting at
 * weekStartISO, with a per-app earnings/hours breakdown for each day.
 * Every app and every day is always present (zeroed if there's no
 * matching shift), so stacked-bar charts get a stable set of series.
 */
export function aggregateWeekByApp(
  shifts: readonly AppDatedShift[],
  apps: readonly Pick<App, "id" | "name">[],
  weekStartISO: string,
): WeeklyDayEarnings[] {
  const days: WeeklyDayEarnings[] = Array.from({ length: 7 }, (_, i) => ({
    date: addDaysISO(weekStartISO, i),
    weekday: WEEKDAY_LABELS[i],
    totalEarnings: 0,
    totalHours: 0,
    avgDollarsPerHour: 0,
    byApp: emptyAppBreakdown(apps),
  }));

  const dayByDate = new Map(days.map((day) => [day.date, day]));

  for (const shift of shifts) {
    const day = dayByDate.get(shift.date);
    const appEntry = day?.byApp.find((entry) => entry.appId === shift.app.id);
    if (!day || !appEntry) continue;

    appEntry.earnings += shift.earnings;
    appEntry.hours += shift.hours;
    day.totalEarnings += shift.earnings;
    day.totalHours += shift.hours;
  }

  for (const day of days) {
    finalizeAppRates(day.byApp);
    day.avgDollarsPerHour = day.totalHours > 0 ? day.totalEarnings / day.totalHours : 0;
  }

  return days;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface MonthlyEarnings {
  month: number;
  monthLabel: string;
  totalEarnings: number;
  totalHours: number;
  avgDollarsPerHour: number;
  byApp: AppBreakdown[];
}

/**
 * Builds one entry per calendar month (Jan-Dec) for the given year, with a
 * per-app earnings/hours breakdown for each month. Every app and every
 * month is always present (zeroed if there's no matching shift).
 */
export function aggregateYearByApp(
  shifts: readonly AppDatedShift[],
  apps: readonly Pick<App, "id" | "name">[],
  year: number,
): MonthlyEarnings[] {
  const months: MonthlyEarnings[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthLabel: MONTH_LABELS[i],
    totalEarnings: 0,
    totalHours: 0,
    avgDollarsPerHour: 0,
    byApp: emptyAppBreakdown(apps),
  }));

  for (const shift of shifts) {
    const [shiftYear, shiftMonth] = shift.date.split("-").map(Number);
    if (shiftYear !== year) continue;

    const month = months[shiftMonth - 1];
    const appEntry = month.byApp.find((entry) => entry.appId === shift.app.id);
    if (!appEntry) continue;

    appEntry.earnings += shift.earnings;
    appEntry.hours += shift.hours;
    month.totalEarnings += shift.earnings;
    month.totalHours += shift.hours;
  }

  for (const month of months) {
    finalizeAppRates(month.byApp);
    month.avgDollarsPerHour = month.totalHours > 0 ? month.totalEarnings / month.totalHours : 0;
  }

  return months;
}

/** The inclusive range of calendar years present in the given shifts, or null if there are none. */
export function getYearRange(shifts: readonly Pick<ShiftWithApp, "date">[]): {
  minYear: number;
  maxYear: number;
} | null {
  if (shifts.length === 0) return null;

  let minYear = Infinity;
  let maxYear = -Infinity;
  for (const shift of shifts) {
    const year = Number(shift.date.slice(0, 4));
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
  }

  return { minYear, maxYear };
}

/** The earliest shift date (ISO), or null if there are none. */
export function getEarliestShiftDate(shifts: readonly Pick<ShiftWithApp, "date">[]): string | null {
  if (shifts.length === 0) return null;
  return shifts.reduce((earliest, shift) => (shift.date < earliest ? shift.date : earliest), shifts[0].date);
}

/** Every Monday (ISO), inclusive, from the week containing fromISO through the week containing toISO. */
export function getWeekStartsBetween(fromISO: string, toISO: string): string[] {
  const start = getMondayOfWeek(fromISO);
  const end = getMondayOfWeek(toISO);

  const weekStarts: string[] = [];
  for (let weekStart = start; weekStart <= end; weekStart = addDaysISO(weekStart, 7)) {
    weekStarts.push(weekStart);
  }
  return weekStarts;
}

export type WeeklyTotal = { weekStart: string } & DashboardTotals;

/**
 * Buckets shifts into Monday-Sunday weeks and runs computeTotals on each
 * week, for every week touching the given calendar year (so a week
 * straddling Dec 31/Jan 1 is fully counted once, under whichever year its
 * Monday falls in). Every week in the span is always present — computeTotals
 * already zero-fills an empty week — so a line chart gets a continuous
 * full-year series.
 */
export function aggregateWeeklyTotalsForYear(
  shifts: readonly DatedEarningsShift[],
  year: number,
): WeeklyTotal[] {
  const weekStarts = getWeekStartsBetween(`${year}-01-01`, `${year}-12-31`);
  const shiftsByWeek = new Map<string, DatedEarningsShift[]>(weekStarts.map((weekStart) => [weekStart, []]));

  for (const shift of shifts) {
    shiftsByWeek.get(getMondayOfWeek(shift.date))?.push(shift);
  }

  return weekStarts.map((weekStart) => ({
    weekStart,
    ...computeTotals(shiftsByWeek.get(weekStart) ?? []),
  }));
}

/** Monday (ISO) of the week containing the last day of dateISO's calendar month. */
export function getMonthEndWeekStart(dateISO: string): string {
  const date = new Date(`${dateISO}T00:00:00Z`);
  const lastDayOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return getMondayOfWeek(lastDayOfMonth.toISOString().slice(0, 10));
}

/**
 * Every Monday (ISO), inclusive, spanning a full month-grid display for the
 * given calendar month: the week containing the 1st through the week
 * containing the last day, even when those weeks spill into neighboring
 * months (e.g. the 1st falling on a Sunday still shows that whole week).
 */
export function getMonthWeekStarts(year: number, month: number): string[] {
  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastOfMonth = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return getWeekStartsBetween(firstOfMonth, lastOfMonth);
}

export interface WeekMonthGroup {
  year: number;
  month: number;
}

/**
 * The calendar month a Monday-Sunday week "belongs to" for grouping in the
 * calendar widget, by majority rule: whichever month has 4+ of the week's 7
 * days. Only the ~1 week per month that straddles a month boundary is
 * actually ambiguous — a week starting Mon/Tue/Wed/Thu belongs to the new
 * month (4-7 of its days fall there); a week starting Fri/Sat/Sun belongs
 * to the previous month (4-6 of its days are still in it).
 */
export function getWeekMonthGroup(weekStartISO: string): WeekMonthGroup {
  const counts = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const key = addDaysISO(weekStartISO, i).slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let bestKey = "";
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }

  const [year, month] = bestKey.split("-").map(Number);
  return { year, month };
}

export interface DateApp {
  appId: number;
  appName: string;
}

/** Maps each date to the distinct apps worked that day, sorted by app name. */
export function getDistinctAppsByDate(shifts: readonly AppDatedShift[]): Record<string, DateApp[]> {
  const byDate = new Map<string, Map<number, DateApp>>();

  for (const shift of shifts) {
    const appsForDate = byDate.get(shift.date) ?? new Map<number, DateApp>();
    appsForDate.set(shift.app.id, { appId: shift.app.id, appName: shift.app.name });
    byDate.set(shift.date, appsForDate);
  }

  const result: Record<string, DateApp[]> = {};
  for (const [date, appsForDate] of byDate) {
    result[date] = [...appsForDate.values()].sort((a, b) => a.appName.localeCompare(b.appName));
  }
  return result;
}

/**
 * Buckets shifts into 7 arrays (Monday-Sunday) for the week starting at
 * weekStartISO, each sorted by start time. Shifts outside that week are
 * dropped.
 */
export function groupShiftsByWeekday<T extends Pick<ShiftWithApp, "date" | "start_time">>(
  shifts: readonly T[],
  weekStartISO: string,
): T[][] {
  const weekEndISO = addDaysISO(weekStartISO, 6);
  const buckets: T[][] = Array.from({ length: 7 }, () => []);

  for (const shift of shifts) {
    if (shift.date < weekStartISO || shift.date > weekEndISO) continue;
    const dayIndex = Math.round(
      (Date.parse(`${shift.date}T00:00:00Z`) - Date.parse(`${weekStartISO}T00:00:00Z`)) / 86_400_000,
    );
    if (dayIndex >= 0 && dayIndex < 7) buckets[dayIndex].push(shift);
  }

  for (const bucket of buckets) {
    bucket.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  return buckets;
}

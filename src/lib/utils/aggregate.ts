import type { App, ShiftWithApp } from "@/types/database.types";

type EarningsShift = Pick<ShiftWithApp, "earnings" | "hours" | "mileage" | "trips">;
type DatedEarningsShift = EarningsShift & Pick<ShiftWithApp, "date">;
type AppEarningsShift = Pick<ShiftWithApp, "earnings" | "hours"> & {
  app: Pick<ShiftWithApp["app"], "name">;
};
type WeeklyShift = Pick<ShiftWithApp, "date" | "earnings" | "hours"> & {
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

export interface EarningsByDate {
  date: string;
  earnings: number;
  hours: number;
  mileage: number;
  trips: number;
}

/** Groups shifts by calendar date and sums their metrics, sorted ascending by date. */
export function aggregateByDate(shifts: readonly DatedEarningsShift[]): EarningsByDate[] {
  const byDate = new Map<string, EarningsByDate>();

  for (const shift of shifts) {
    const existing = byDate.get(shift.date) ?? {
      date: shift.date,
      earnings: 0,
      hours: 0,
      mileage: 0,
      trips: 0,
    };
    existing.earnings += shift.earnings;
    existing.hours += shift.hours;
    existing.mileage += shift.mileage;
    existing.trips += shift.trips;
    byDate.set(shift.date, existing);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
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

export interface WeeklyAppEarnings {
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
  byApp: WeeklyAppEarnings[];
}

/**
 * Builds one entry per day (Monday-Sunday) for the week starting at
 * weekStartISO, with a per-app earnings/hours breakdown for each day.
 * Every app and every day is always present (zeroed if there's no
 * matching shift), so stacked-bar charts get a stable set of series.
 */
export function aggregateWeekByApp(
  shifts: readonly WeeklyShift[],
  apps: readonly Pick<App, "id" | "name">[],
  weekStartISO: string,
): WeeklyDayEarnings[] {
  const days: WeeklyDayEarnings[] = Array.from({ length: 7 }, (_, i) => ({
    date: addDaysISO(weekStartISO, i),
    weekday: WEEKDAY_LABELS[i],
    totalEarnings: 0,
    totalHours: 0,
    avgDollarsPerHour: 0,
    byApp: apps.map((app) => ({
      appId: app.id,
      appName: app.name,
      earnings: 0,
      hours: 0,
      dollarsPerHour: 0,
    })),
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
    for (const appEntry of day.byApp) {
      appEntry.dollarsPerHour = appEntry.hours > 0 ? appEntry.earnings / appEntry.hours : 0;
    }
    day.avgDollarsPerHour = day.totalHours > 0 ? day.totalEarnings / day.totalHours : 0;
  }

  return days;
}

import type { ShiftWithApp } from "@/types/database.types";

type EarningsShift = Pick<ShiftWithApp, "earnings" | "hours" | "mileage" | "trips">;
type DatedEarningsShift = EarningsShift & Pick<ShiftWithApp, "date">;
type AppEarningsShift = Pick<ShiftWithApp, "earnings" | "hours"> & {
  app: Pick<ShiftWithApp["app"], "name">;
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

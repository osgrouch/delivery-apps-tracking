import { describe, expect, it } from "vitest";

import {
  aggregateByApp,
  aggregateByDate,
  computeTotals,
  deriveShiftMetrics,
} from "@/lib/utils/aggregate";

describe("deriveShiftMetrics", () => {
  it("computes dollar rates from earnings, hours, mileage, and trips", () => {
    const metrics = deriveShiftMetrics({ earnings: 100, hours: 4, mileage: 50, trips: 10 });

    expect(metrics.dollarsPerHour).toBe(25);
    expect(metrics.dollarsPerMile).toBe(2);
    expect(metrics.dollarsPerTrip).toBe(10);
  });

  it("returns 0 instead of NaN/Infinity for zero denominators", () => {
    const metrics = deriveShiftMetrics({ earnings: 100, hours: 0, mileage: 0, trips: 0 });

    expect(metrics).toEqual({ dollarsPerHour: 0, dollarsPerMile: 0, dollarsPerTrip: 0 });
  });
});

describe("computeTotals", () => {
  it("sums metrics across shifts and blends rates from the totals", () => {
    const totals = computeTotals([
      { earnings: 100, hours: 4, mileage: 40, trips: 8 },
      { earnings: 50, hours: 2, mileage: 20, trips: 4 },
    ]);

    expect(totals.shiftCount).toBe(2);
    expect(totals.totalEarnings).toBe(150);
    expect(totals.totalHours).toBe(6);
    expect(totals.totalMileage).toBe(60);
    expect(totals.totalTrips).toBe(12);
    expect(totals.avgDollarsPerHour).toBe(25);
    expect(totals.avgDollarsPerMile).toBe(2.5);
    expect(totals.avgDollarsPerTrip).toBe(12.5);
  });

  it("handles an empty list without dividing by zero", () => {
    const totals = computeTotals([]);

    expect(totals).toEqual({
      shiftCount: 0,
      totalEarnings: 0,
      totalHours: 0,
      totalMileage: 0,
      totalTrips: 0,
      avgDollarsPerHour: 0,
      avgDollarsPerMile: 0,
      avgDollarsPerTrip: 0,
    });
  });
});

describe("aggregateByDate", () => {
  it("groups shifts on the same date and sums their metrics", () => {
    const result = aggregateByDate([
      { date: "2026-01-02", earnings: 50, hours: 2, mileage: 10, trips: 3 },
      { date: "2026-01-01", earnings: 100, hours: 4, mileage: 20, trips: 5 },
      { date: "2026-01-01", earnings: 25, hours: 1, mileage: 5, trips: 2 },
    ]);

    expect(result).toEqual([
      { date: "2026-01-01", earnings: 125, hours: 5, mileage: 25, trips: 7 },
      { date: "2026-01-02", earnings: 50, hours: 2, mileage: 10, trips: 3 },
    ]);
  });

  it("returns an empty array for no shifts", () => {
    expect(aggregateByDate([])).toEqual([]);
  });
});

describe("aggregateByApp", () => {
  it("groups shifts by app name and sorts descending by earnings", () => {
    const result = aggregateByApp([
      { earnings: 30, hours: 2, app: { name: "Doordash" } },
      { earnings: 100, hours: 4, app: { name: "Uber Eats" } },
      { earnings: 20, hours: 1, app: { name: "Doordash" } },
    ]);

    expect(result).toEqual([
      { appName: "Uber Eats", earnings: 100, shiftCount: 1, dollarsPerHour: 25 },
      { appName: "Doordash", earnings: 50, shiftCount: 2, dollarsPerHour: 50 / 3 },
    ]);
  });
});

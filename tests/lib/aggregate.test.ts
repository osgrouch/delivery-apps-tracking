import { describe, expect, it } from "vitest";

import {
  addDaysISO,
  aggregateByApp,
  aggregateByDate,
  aggregateWeekByApp,
  computeTotals,
  deriveShiftMetrics,
  getMondayOfWeek,
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

describe("getMondayOfWeek", () => {
  it("returns the same date when given a Monday", () => {
    expect(getMondayOfWeek("2026-06-29")).toBe("2026-06-29");
  });

  it("rolls a Thursday back to the preceding Monday", () => {
    expect(getMondayOfWeek("2026-07-02")).toBe("2026-06-29");
  });

  it("rolls a Sunday back to the preceding Monday", () => {
    expect(getMondayOfWeek("2026-07-05")).toBe("2026-06-29");
  });
});

describe("addDaysISO", () => {
  it("adds days, including across a month boundary", () => {
    expect(addDaysISO("2026-06-29", 6)).toBe("2026-07-05");
  });

  it("subtracts days when given a negative count", () => {
    expect(addDaysISO("2026-06-29", -7)).toBe("2026-06-22");
  });
});

describe("aggregateWeekByApp", () => {
  const apps = [
    { id: 1, name: "Doordash" },
    { id: 2, name: "Uber Eats" },
  ];

  it("builds all 7 days with every app present, zeroed where there's no shift", () => {
    const result = aggregateWeekByApp([], apps, "2026-06-29");

    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({
      date: "2026-06-29",
      weekday: "Mon",
      totalEarnings: 0,
      totalHours: 0,
      avgDollarsPerHour: 0,
      byApp: [
        { appId: 1, appName: "Doordash", earnings: 0, hours: 0, dollarsPerHour: 0 },
        { appId: 2, appName: "Uber Eats", earnings: 0, hours: 0, dollarsPerHour: 0 },
      ],
    });
    expect(result[6].date).toBe("2026-07-05");
    expect(result[6].weekday).toBe("Sun");
  });

  it("sums earnings and hours per app per day and computes day totals/rates", () => {
    const shifts = [
      { date: "2026-06-29", earnings: 50, hours: 2, app: { id: 1, name: "Doordash" } },
      { date: "2026-06-29", earnings: 20, hours: 1, app: { id: 2, name: "Uber Eats" } },
      { date: "2026-06-30", earnings: 30, hours: 3, app: { id: 1, name: "Doordash" } },
    ];

    const result = aggregateWeekByApp(shifts, apps, "2026-06-29");

    expect(result[0].totalEarnings).toBe(70);
    expect(result[0].totalHours).toBe(3);
    expect(result[0].avgDollarsPerHour).toBeCloseTo(23.33, 2);
    expect(result[0].byApp).toEqual([
      { appId: 1, appName: "Doordash", earnings: 50, hours: 2, dollarsPerHour: 25 },
      { appId: 2, appName: "Uber Eats", earnings: 20, hours: 1, dollarsPerHour: 20 },
    ]);

    expect(result[1].totalEarnings).toBe(30);
    expect(result[1].byApp[0]).toEqual({
      appId: 1,
      appName: "Doordash",
      earnings: 30,
      hours: 3,
      dollarsPerHour: 10,
    });
  });

  it("ignores shifts outside the requested week", () => {
    const shifts = [{ date: "2026-07-10", earnings: 100, hours: 4, app: { id: 1, name: "Doordash" } }];

    const result = aggregateWeekByApp(shifts, apps, "2026-06-29");

    expect(result.every((day) => day.totalEarnings === 0)).toBe(true);
  });
});

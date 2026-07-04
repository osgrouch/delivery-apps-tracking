import { describe, expect, it } from "vitest";

import {
  addDaysISO,
  aggregateByApp,
  aggregateByDate,
  aggregateWeekByApp,
  aggregateYearByApp,
  computeTotals,
  deriveShiftMetrics,
  getDistinctAppsByDate,
  getEarliestShiftDate,
  getMondayOfWeek,
  getMonthEndWeekStart,
  getWeekMonthGroup,
  getWeekStartsBetween,
  getYearRange,
  groupShiftsByWeekday,
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

describe("aggregateYearByApp", () => {
  const apps = [
    { id: 1, name: "Doordash" },
    { id: 2, name: "Uber Eats" },
  ];

  it("builds all 12 months with every app present, zeroed where there's no shift", () => {
    const result = aggregateYearByApp([], apps, 2026);

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({
      month: 1,
      monthLabel: "Jan",
      totalEarnings: 0,
      totalHours: 0,
      avgDollarsPerHour: 0,
      byApp: [
        { appId: 1, appName: "Doordash", earnings: 0, hours: 0, dollarsPerHour: 0 },
        { appId: 2, appName: "Uber Eats", earnings: 0, hours: 0, dollarsPerHour: 0 },
      ],
    });
    expect(result[11].month).toBe(12);
    expect(result[11].monthLabel).toBe("Dec");
  });

  it("sums earnings and hours per app per month and computes month totals/rates", () => {
    const shifts = [
      { date: "2026-01-05", earnings: 50, hours: 2, app: { id: 1, name: "Doordash" } },
      { date: "2026-01-20", earnings: 20, hours: 1, app: { id: 2, name: "Uber Eats" } },
      { date: "2026-02-01", earnings: 30, hours: 3, app: { id: 1, name: "Doordash" } },
    ];

    const result = aggregateYearByApp(shifts, apps, 2026);

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

  it("ignores shifts outside the requested year", () => {
    const shifts = [{ date: "2025-06-01", earnings: 100, hours: 4, app: { id: 1, name: "Doordash" } }];

    const result = aggregateYearByApp(shifts, apps, 2026);

    expect(result.every((month) => month.totalEarnings === 0)).toBe(true);
  });
});

describe("getYearRange", () => {
  it("returns null for no shifts", () => {
    expect(getYearRange([])).toBeNull();
  });

  it("returns the min and max year across shifts", () => {
    const result = getYearRange([{ date: "2026-03-01" }, { date: "2024-11-01" }, { date: "2025-01-01" }]);

    expect(result).toEqual({ minYear: 2024, maxYear: 2026 });
  });

  it("returns the same year twice when all shifts are in one year", () => {
    const result = getYearRange([{ date: "2026-01-01" }, { date: "2026-12-31" }]);

    expect(result).toEqual({ minYear: 2026, maxYear: 2026 });
  });
});

describe("getEarliestShiftDate", () => {
  it("returns null for no shifts", () => {
    expect(getEarliestShiftDate([])).toBeNull();
  });

  it("returns the earliest date regardless of input order", () => {
    const result = getEarliestShiftDate([{ date: "2026-03-01" }, { date: "2025-06-15" }, { date: "2026-01-01" }]);

    expect(result).toBe("2025-06-15");
  });
});

describe("getWeekStartsBetween", () => {
  it("returns a single Monday when from and to are in the same week", () => {
    expect(getWeekStartsBetween("2026-06-30", "2026-07-02")).toEqual(["2026-06-29"]);
  });

  it("returns every Monday spanning multiple weeks, inclusive", () => {
    expect(getWeekStartsBetween("2026-06-29", "2026-07-13")).toEqual([
      "2026-06-29",
      "2026-07-06",
      "2026-07-13",
    ]);
  });

  it("normalizes non-Monday endpoints to their containing week", () => {
    expect(getWeekStartsBetween("2026-07-02", "2026-07-05")).toEqual(["2026-06-29"]);
  });
});

describe("getMonthEndWeekStart", () => {
  it("returns the Monday of the week containing the month's last day", () => {
    expect(getMonthEndWeekStart("2026-06-15")).toBe("2026-06-29");
  });

  it("works when the last day falls near the end of its own week", () => {
    expect(getMonthEndWeekStart("2026-07-10")).toBe("2026-07-27");
  });

  it("works for a short month (February, non-leap year)", () => {
    expect(getMonthEndWeekStart("2026-02-10")).toBe("2026-02-23");
  });
});

describe("getDistinctAppsByDate", () => {
  it("dedupes multiple shifts for the same app on the same date", () => {
    const result = getDistinctAppsByDate([
      { date: "2026-06-01", earnings: 10, hours: 1, app: { id: 1, name: "Doordash" } },
      { date: "2026-06-01", earnings: 20, hours: 2, app: { id: 1, name: "Doordash" } },
    ]);

    expect(result).toEqual({ "2026-06-01": [{ appId: 1, appName: "Doordash" }] });
  });

  it("lists multiple distinct apps on the same date, sorted by name", () => {
    const result = getDistinctAppsByDate([
      { date: "2026-06-01", earnings: 10, hours: 1, app: { id: 2, name: "Uber Eats" } },
      { date: "2026-06-01", earnings: 20, hours: 2, app: { id: 1, name: "Doordash" } },
    ]);

    expect(result["2026-06-01"]).toEqual([
      { appId: 1, appName: "Doordash" },
      { appId: 2, appName: "Uber Eats" },
    ]);
  });
});

describe("groupShiftsByWeekday", () => {
  it("buckets shifts into the correct day of a Monday-Sunday week", () => {
    const shifts = [
      { date: "2026-07-01", start_time: "09:00" },
      { date: "2026-06-29", start_time: "08:00" },
      { date: "2026-07-05", start_time: "10:00" },
    ];

    const result = groupShiftsByWeekday(shifts, "2026-06-29");

    expect(result[0]).toEqual([{ date: "2026-06-29", start_time: "08:00" }]);
    expect(result[2]).toEqual([{ date: "2026-07-01", start_time: "09:00" }]);
    expect(result[6]).toEqual([{ date: "2026-07-05", start_time: "10:00" }]);
    expect(result[1]).toEqual([]);
  });

  it("sorts multiple shifts on the same day by start time", () => {
    const shifts = [
      { date: "2026-06-29", start_time: "17:00" },
      { date: "2026-06-29", start_time: "09:00" },
    ];

    const result = groupShiftsByWeekday(shifts, "2026-06-29");

    expect(result[0].map((s) => s.start_time)).toEqual(["09:00", "17:00"]);
  });

  it("drops shifts outside the requested week", () => {
    const shifts = [{ date: "2026-07-10", start_time: "09:00" }];

    const result = groupShiftsByWeekday(shifts, "2026-06-29");

    expect(result.every((bucket) => bucket.length === 0)).toBe(true);
  });
});

describe("getWeekMonthGroup", () => {
  it("assigns a week fully inside one month to that month", () => {
    expect(getWeekMonthGroup("2026-06-01")).toEqual({ year: 2026, month: 6 });
  });

  it("assigns a week starting Wednesday (new month has the majority) to the new month", () => {
    // 2026-07-01 is a Wednesday: Mon-Tue (Jun 29-30) old, Wed-Sun (Jul 1-5) new, new wins 5-2.
    expect(getWeekMonthGroup("2026-06-29")).toEqual({ year: 2026, month: 7 });
  });

  it("assigns a week starting Sunday (previous month has the majority) to the previous month", () => {
    // 2026-02-01 is a Sunday: Mon-Sat (Jan 26-31) old, Sun (Feb 1) new, old wins 6-1.
    expect(getWeekMonthGroup("2026-01-26")).toEqual({ year: 2026, month: 1 });
  });

  it("assigns a week starting Friday (previous month has the majority) to the previous month", () => {
    // 2026-05-01 is a Friday: Mon-Thu (Apr 27-30) old, Fri-Sun (May 1-3) new, old wins 4-3.
    expect(getWeekMonthGroup("2026-04-27")).toEqual({ year: 2026, month: 4 });
  });

  it("assigns a week starting Thursday (new month has a bare majority) to the new month, crossing a year boundary", () => {
    // 2026-01-01 is a Thursday: Mon-Wed (Dec 29-31, 2025) old, Thu-Sun (Jan 1-4) new, new wins 4-3.
    expect(getWeekMonthGroup("2025-12-29")).toEqual({ year: 2026, month: 1 });
  });
});

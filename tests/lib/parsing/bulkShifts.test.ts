import { describe, expect, it } from "vitest";

import { parseBulkShiftsText } from "@/lib/parsing/bulkShifts";
import type { App } from "@/types/database.types";

const apps: App[] = [
  { id: 1, name: "Uber Eats", color: "#286ef0" },
  { id: 2, name: "Doordash", color: "#f72e09" },
  { id: 3, name: "InstaCart", color: "#09af07" },
];

const referenceDate = new Date("2026-06-30T00:00:00");

describe("parseBulkShiftsText", () => {
  it("parses a single shift with an explicit date and no colon in the time range", () => {
    const text = ["6/30", "Uber Eats", "142.50", "38.2", "12", "930-1400"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts).toHaveLength(1);
    expect(result.shifts[0]).toMatchObject({
      appId: 1,
      appName: "Uber Eats",
      date: "2026-06-30",
      startTime: "09:30",
      endTime: "14:00",
      earnings: 142.5,
      mileage: 38.2,
      trips: 12,
      hours: 4.5,
    });
  });

  it("reuses the last date across multiple shifts until a new one appears", () => {
    const text = [
      "6/30",
      "Uber Eats",
      "100",
      "20",
      "5",
      "900-1200",
      "Doordash",
      "80",
      "15",
      "4",
      "1300-1600",
      "7/1",
      "InstaCart",
      "60",
      "10",
      "3",
      "1000-1200",
    ].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts).toHaveLength(3);
    expect(result.shifts[0].date).toBe("2026-06-30");
    expect(result.shifts[1].date).toBe("2026-06-30");
    expect(result.shifts[2].date).toBe("2026-07-01");
  });

  it("defaults the year to the reference year when omitted", () => {
    const text = ["6/30", "Doordash", "50", "10", "2", "800-1000"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts[0].date).toBe("2026-06-30");
  });

  it("parses a full date with an explicit year", () => {
    const text = ["6/30/2025", "Doordash", "50", "10", "2", "800-1000"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts[0].date).toBe("2025-06-30");
  });

  it("parses times with colons and am/pm suffixes", () => {
    const text = ["6/30", "Uber Eats", "100", "20", "5", "5:30pm-11:00pm"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts[0]).toMatchObject({ startTime: "17:30", endTime: "23:00", hours: 5.5 });
  });

  it("computes wraparound hours for a shift that crosses midnight", () => {
    const text = ["6/30", "Doordash", "100", "20", "5", "2200-0100"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts[0]).toMatchObject({ startTime: "22:00", endTime: "01:00", hours: 3 });
  });

  it("flags a shift with no date given yet", () => {
    const text = ["Uber Eats", "100", "20", "5", "900-1200"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts).toHaveLength(0);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].message).toMatch(/no date/i);
  });

  it("flags an unrecognized app name", () => {
    const text = ["6/30", "Grubhub", "100", "20", "5", "900-1200"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts).toHaveLength(0);
    expect(result.issues[0].message).toMatch(/Grubhub/);
  });

  it("flags an unparseable time range", () => {
    const text = ["6/30", "Uber Eats", "100", "20", "5", "not-a-range"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts).toHaveLength(0);
    expect(result.issues[0].message).toMatch(/time range/i);
  });

  it("flags a trailing incomplete shift", () => {
    const text = ["6/30", "Uber Eats", "100", "20"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.shifts).toHaveLength(0);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].message).toMatch(/missing/i);
  });

  it("strips a $ prefix on earnings, an mi suffix on mileage, and a trips suffix on trip count", () => {
    const text = ["6/30", "Uber Eats", "$142.50", "38.2 mi", "12 trips", "930-1400"].join("\n");

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts[0]).toMatchObject({ earnings: 142.5, mileage: 38.2, trips: 12 });
  });

  it("ignores blank lines between shifts", () => {
    const text = ["6/30", "Uber Eats", "100", "20", "5", "900-1200", "", "Doordash", "80", "15", "4", "1300-1600"].join(
      "\n",
    );

    const result = parseBulkShiftsText(text, apps, referenceDate);

    expect(result.issues).toEqual([]);
    expect(result.shifts).toHaveLength(2);
  });
});

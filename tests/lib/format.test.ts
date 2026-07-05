import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatDuration,
  formatMonthYear,
  formatNumber,
  formatShortDate,
  formatWeekRangeTitle,
} from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats a number as USD currency", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string without shifting the day", () => {
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});

describe("formatShortDate", () => {
  it("formats an ISO date string as compact M/D without shifting the day", () => {
    expect(formatShortDate("2026-01-01")).toBe("1/1");
  });
});

describe("formatMonthYear", () => {
  it("formats a full month name and year", () => {
    expect(formatMonthYear(2026, 7)).toBe("July 2026");
  });

  it("does not shift to the previous month across a year boundary", () => {
    expect(formatMonthYear(2026, 1)).toBe("January 2026");
  });
});

describe("formatWeekRangeTitle", () => {
  it("formats a week within a single month", () => {
    expect(formatWeekRangeTitle("2026-07-06", "2026-07-12")).toBe("Week of July 6-12, 2026");
  });

  it("shows both month names when the week spans a month boundary", () => {
    expect(formatWeekRangeTitle("2026-07-27", "2026-08-02")).toBe("Week of July 27-August 2, 2026");
  });

  it("shows both years when the week spans a year boundary", () => {
    expect(formatWeekRangeTitle("2026-12-28", "2027-01-03")).toBe(
      "Week of December 28, 2026-January 3, 2027",
    );
  });
});

describe("formatDuration", () => {
  it("omits minutes for a whole number of hours", () => {
    expect(formatDuration(4)).toBe("4h");
  });

  it("includes minutes for a fractional number of hours", () => {
    expect(formatDuration(2.5)).toBe("2h 30m");
  });

  it("rounds to the nearest minute", () => {
    expect(formatDuration(1.98)).toBe("1h 59m");
  });
});

describe("formatNumber", () => {
  it("defaults to one fraction digit", () => {
    expect(formatNumber(5.678)).toBe("5.7");
  });

  it("respects a custom fraction digit count", () => {
    expect(formatNumber(5.678, 2)).toBe("5.68");
  });
});

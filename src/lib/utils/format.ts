const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const monthNameFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  // Append a time to avoid the browser interpreting a bare "YYYY-MM-DD"
  // as UTC midnight and rendering the previous day in negative-offset zones.
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

/** Compact "M/D" form, e.g. for chart axis ticks where space is tight. */
export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatNumber(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits);
}

/** e.g. 2.5 -> "2h 30m", 4 -> "4h" (whole hours omit the minutes part). */
export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}

/** e.g. "June 2026", for a calendar's month section titles. */
export function formatMonthYear(year: number, month: number): string {
  return monthYearFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

/**
 * e.g. "Week of July 6-12, 2026", or "Week of July 27-August 2, 2026" when
 * the week spans two months (and "Week of December 29, 2026-January 4, 2027"
 * when it also spans a year boundary).
 */
export function formatWeekRangeTitle(weekStartISO: string, weekEndISO: string): string {
  const start = new Date(`${weekStartISO}T00:00:00Z`);
  const end = new Date(`${weekEndISO}T00:00:00Z`);
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = monthNameFormatter.format(start);
  const endMonth = monthNameFormatter.format(end);
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();

  if (startYear !== endYear) {
    return `Week of ${startMonth} ${startDay}, ${startYear}-${endMonth} ${endDay}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `Week of ${startMonth} ${startDay}-${endMonth} ${endDay}, ${startYear}`;
  }
  return `Week of ${startMonth} ${startDay}-${endDay}, ${startYear}`;
}

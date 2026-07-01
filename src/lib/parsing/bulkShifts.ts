import { shiftFieldsSchema } from "@/lib/validation/shift";
import type { App } from "@/types/database.types";

/**
 * Parses free-form pasted text describing one or more delivery shifts.
 * Expected shape, repeated for each shift:
 *
 *   [DATE]              (optional — reuses the last date seen if omitted)
 *   [APP]
 *   [EARNINGS]
 *   [MILES]
 *   [TRIPS COUNT]
 *   [START]-[END]
 *
 * DATE lines only need to appear when the date changes; every other line
 * is required for every shift. Times may be 24-hour with or without a
 * colon (e.g. "1730", "17:30") or 12-hour with an am/pm suffix
 * (e.g. "530pm", "5:30pm"). Shifts that cross midnight are supported —
 * hours are computed with wraparound rather than rejected.
 */

export interface ParsedShift {
  /** 1-indexed line number where this shift's app line starts, for UI display. */
  lineNumber: number;
  appId: number;
  appName: string;
  date: string;
  startTime: string;
  endTime: string;
  earnings: number;
  mileage: number;
  trips: number;
  hours: number;
}

export interface ParseIssue {
  lineNumber: number;
  message: string;
}

export interface BulkParseResult {
  shifts: ParsedShift[];
  issues: ParseIssue[];
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function matchApp(raw: string, apps: App[]): App | undefined {
  const normalized = raw.trim().toLowerCase();
  return apps.find((app) => app.name.toLowerCase() === normalized);
}

/** Only US slash dates: "M/D" or "M/D/YYYY" (year defaults to referenceYear). */
function tryParseDate(raw: string, referenceYear: number): string | null {
  const match = raw.trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let year = referenceYear;
  if (match[3]) {
    year = Number(match[3]);
    if (match[3].length === 2) year += 2000;
  }

  return `${year.toString().padStart(4, "0")}-${pad(month)}-${pad(day)}`;
}

function parseTimeToken(raw: string): { hour: number; minute: number } | null {
  const meridiemMatch = raw.trim().toLowerCase().match(/^(.*?)\s*(am|pm)$/);
  const digits = meridiemMatch ? meridiemMatch[1] : raw.trim();
  const meridiem = meridiemMatch ? meridiemMatch[2] : null;

  let hour: number;
  let minute: number;

  if (digits.includes(":")) {
    const [h, m] = digits.split(":");
    if (!/^\d{1,2}$/.test(h) || !/^\d{1,2}$/.test(m)) return null;
    hour = Number(h);
    minute = Number(m);
  } else {
    if (!/^\d{1,4}$/.test(digits)) return null;
    if (digits.length <= 2) {
      hour = Number(digits);
      minute = 0;
    } else {
      hour = Number(digits.slice(0, -2));
      minute = Number(digits.slice(-2));
    }
  }

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function parseTimeRange(raw: string): { start: string; end: string } | null {
  const parts = raw.split(/[-–]/);
  if (parts.length !== 2) return null;

  const start = parseTimeToken(parts[0]);
  const end = parseTimeToken(parts[1]);
  if (!start || !end) return null;

  return {
    start: `${pad(start.hour)}:${pad(start.minute)}`,
    end: `${pad(end.hour)}:${pad(end.minute)}`,
  };
}

/** Hours between start and end, wrapping past midnight if end <= start. */
function computeHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function parseBulkShiftsText(
  text: string,
  apps: App[],
  referenceDate: Date = new Date(),
): BulkParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const issues: ParseIssue[] = [];
  const shifts: ParsedShift[] = [];
  const referenceYear = referenceDate.getFullYear();

  let currentDate: string | null = null;
  let i = 0;

  while (i < lines.length) {
    const lineNumber = i + 1;
    let line = lines[i];

    const maybeDate = tryParseDate(line, referenceYear);
    if (maybeDate && !matchApp(line, apps)) {
      currentDate = maybeDate;
      i++;
      if (i >= lines.length) {
        issues.push({ lineNumber, message: "Date is not followed by a shift" });
        break;
      }
      line = lines[i];
    }

    const app = matchApp(line, apps);
    if (!app) {
      issues.push({
        lineNumber: i + 1,
        message: `Expected an app name (${apps.map((a) => a.name).join(", ")}) or a date, got "${line}"`,
      });
      i++;
      continue;
    }
    i++;

    if (i + 3 >= lines.length) {
      issues.push({
        lineNumber,
        message: `Shift for ${app.name} is missing earnings, mileage, trips, or a time range`,
      });
      break;
    }

    const earningsLine = lines[i++];
    const mileageLine = lines[i++];
    const tripsLine = lines[i++];
    const rangeLine = lines[i++];

    if (!currentDate) {
      issues.push({ lineNumber, message: `Shift for ${app.name} has no date yet — add a date line before it` });
      continue;
    }

    const earnings = parseNumber(earningsLine);
    if (earnings === null) {
      issues.push({ lineNumber, message: `Could not parse earnings "${earningsLine}"` });
      continue;
    }

    const mileage = parseNumber(mileageLine);
    if (mileage === null) {
      issues.push({ lineNumber, message: `Could not parse mileage "${mileageLine}"` });
      continue;
    }

    const trips = parseNumber(tripsLine);
    if (trips === null) {
      issues.push({ lineNumber, message: `Could not parse trip count "${tripsLine}"` });
      continue;
    }

    const range = parseTimeRange(rangeLine);
    if (!range) {
      issues.push({ lineNumber, message: `Could not parse start-end time range "${rangeLine}"` });
      continue;
    }

    shifts.push({
      lineNumber,
      appId: app.id,
      appName: app.name,
      date: currentDate,
      startTime: range.start,
      endTime: range.end,
      earnings,
      mileage,
      trips: Math.trunc(trips),
      hours: computeHours(range.start, range.end),
    });
  }

  for (const shift of shifts) {
    const validated = shiftFieldsSchema.safeParse(shift);
    if (!validated.success) {
      issues.push({
        lineNumber: shift.lineNumber,
        message: validated.error.issues.map((issue) => issue.message).join(", "),
      });
    }
  }

  return { shifts, issues };
}

import { z } from "zod";

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Field-level rules shared by every shift entry path (manual form, bulk
 * paste importer, historical-data script). Does not constrain how start
 * and end relate to each other, since the bulk importer allows shifts
 * that cross midnight (end time computed with wraparound).
 */
export const shiftFieldsSchema = z.object({
  appId: z.coerce.number().int().positive("Select a delivery app"),
  date: z.string().date("Enter a valid date"),
  startTime: z.string().regex(TIME_RE, "Use 24-hour HH:MM format"),
  endTime: z.string().regex(TIME_RE, "Use 24-hour HH:MM format"),
  earnings: z.coerce.number().nonnegative("Earnings can't be negative"),
  mileage: z.coerce.number().nonnegative("Mileage can't be negative"),
  trips: z.coerce.number().int().nonnegative("Trips can't be negative"),
  hours: z.coerce.number().positive("Hours must be greater than 0"),
});

/**
 * Validates a single delivery shift as entered through the manual form.
 * Same-day shifts only — end time must be after start time.
 */
export const shiftFormSchema = shiftFieldsSchema.refine(
  (shift) => shift.endTime > shift.startTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  },
);

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;

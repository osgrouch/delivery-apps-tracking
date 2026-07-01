import { z } from "zod";

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates a single delivery shift as entered through the manual form or
 * the historical-data importer. Shared by the server action and the
 * import script so both paths enforce identical rules.
 */
export const shiftFormSchema = z
  .object({
    appId: z.coerce.number().int().positive("Select a delivery app"),
    date: z.string().date("Enter a valid date"),
    startTime: z.string().regex(TIME_RE, "Use 24-hour HH:MM format"),
    endTime: z.string().regex(TIME_RE, "Use 24-hour HH:MM format"),
    earnings: z.coerce.number().nonnegative("Earnings can't be negative"),
    mileage: z.coerce.number().nonnegative("Mileage can't be negative"),
    trips: z.coerce.number().int().nonnegative("Trips can't be negative"),
    hours: z.coerce.number().positive("Hours must be greater than 0"),
  })
  .refine((shift) => shift.endTime > shift.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;

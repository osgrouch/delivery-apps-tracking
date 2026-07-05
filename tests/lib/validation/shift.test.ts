import { describe, expect, it } from "vitest";

import { shiftFormSchema } from "@/lib/validation/shift";

const validShift = {
  appId: "1",
  date: "2026-01-01",
  startTime: "09:00",
  endTime: "17:00",
  earnings: "120.50",
  mileage: "45.2",
  trips: "12",
};

describe("shiftFormSchema", () => {
  it("accepts a valid shift and coerces string form fields to numbers", () => {
    const result = shiftFormSchema.parse(validShift);

    expect(result).toEqual({
      appId: 1,
      date: "2026-01-01",
      startTime: "09:00",
      endTime: "17:00",
      earnings: 120.5,
      mileage: 45.2,
      trips: 12,
    });
  });

  it("rejects an end time that is not after the start time", () => {
    const result = shiftFormSchema.safeParse({ ...validShift, startTime: "17:00", endTime: "09:00" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endTime).toContain(
        "End time must be after start time",
      );
    }
  });

  it("rejects negative earnings", () => {
    const result = shiftFormSchema.safeParse({ ...validShift, earnings: "-5" });

    expect(result.success).toBe(false);
  });

  it("rejects a malformed time string", () => {
    const result = shiftFormSchema.safeParse({ ...validShift, startTime: "25:99" });

    expect(result.success).toBe(false);
  });

  it("rejects a non-positive app id", () => {
    const result = shiftFormSchema.safeParse({ ...validShift, appId: "0" });

    expect(result.success).toBe(false);
  });
});

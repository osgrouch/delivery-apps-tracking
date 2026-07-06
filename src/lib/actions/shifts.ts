"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { computeHoursFromTimes } from "@/lib/utils/aggregate";
import { shiftFieldsSchema, shiftFormSchema } from "@/lib/validation/shift";
import type { ParsedShift } from "@/lib/parsing/bulkShifts";

export interface ShiftActionResult {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: boolean;
}

function parseShiftForm(formData: FormData) {
  return shiftFormSchema.safeParse({
    appId: formData.get("appId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    earnings: formData.get("earnings"),
    mileage: formData.get("mileage"),
    trips: formData.get("trips"),
  });
}

export async function createShift(
  _prevState: ShiftActionResult,
  formData: FormData,
): Promise<ShiftActionResult> {
  const parsed = parseShiftForm(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shifts").insert({
    app_id: parsed.data.appId,
    date: parsed.data.date,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    earnings: parsed.data.earnings,
    mileage: parsed.data.mileage,
    trips: parsed.data.trips,
    hours: computeHoursFromTimes(parsed.data.startTime, parsed.data.endTime),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/all-time");
  redirect("/all-time");
}

export interface BulkCreateShiftsResult {
  error?: string;
}

/**
 * Inserts shifts parsed by the bulk-paste importer. Re-validates each one
 * server-side (never trust client-parsed data) before writing.
 */
export async function bulkCreateShifts(shifts: ParsedShift[]): Promise<BulkCreateShiftsResult> {
  if (shifts.length === 0) {
    return { error: "No shifts to save" };
  }

  const rows = [];
  for (const shift of shifts) {
    const parsed = shiftFieldsSchema.safeParse(shift);
    if (!parsed.success) {
      return { error: `Invalid shift on line ${shift.lineNumber}: ${parsed.error.issues[0]?.message}` };
    }
    rows.push({
      app_id: parsed.data.appId,
      date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      earnings: parsed.data.earnings,
      mileage: parsed.data.mileage,
      trips: parsed.data.trips,
      hours: parsed.data.hours,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shifts").insert(rows);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/all-time");
  redirect("/all-time");
}

export async function updateShiftInPlace(
  id: string,
  _prevState: ShiftActionResult,
  formData: FormData,
): Promise<ShiftActionResult> {
  const parsed = parseShiftForm(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shifts")
    .update({
      app_id: parsed.data.appId,
      date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      earnings: parsed.data.earnings,
      mileage: parsed.data.mileage,
      trips: parsed.data.trips,
      hours: computeHoursFromTimes(parsed.data.startTime, parsed.data.endTime),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/all-time");
  revalidatePath("/weekly");
  refresh();
  return { success: true };
}

export async function deleteShift(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete shift ${id}: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/all-time");
}

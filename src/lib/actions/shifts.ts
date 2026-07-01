"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { shiftFormSchema } from "@/lib/validation/shift";

export interface ShiftActionResult {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
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
    hours: formData.get("hours"),
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
    hours: parsed.data.hours,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/shifts");
  redirect("/shifts");
}

export async function updateShift(
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
      hours: parsed.data.hours,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/shifts");
  redirect("/shifts");
}

export async function deleteShift(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shifts").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete shift ${id}: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/shifts");
}

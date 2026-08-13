"use server";

import { refresh, revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface CatalogActionResult {
  error?: string;
  success?: boolean;
}

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = "23505";

const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export async function createApp(
  _prevState: CatalogActionResult,
  formData: FormData,
): Promise<CatalogActionResult> {
  const name = formData.get("name")?.toString().trim();
  if (!name) {
    return { error: "Enter an app name" };
  }

  const color = formData.get("color")?.toString().trim();
  if (!color || !HEX_COLOR_RE.test(color)) {
    return { error: "Pick a valid color" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("apps").insert({ name, color });

  if (error) {
    return { error: error.code === UNIQUE_VIOLATION ? `"${name}" is already an app` : error.message };
  }

  revalidatePath("/shifts/new");
  refresh();
  return { success: true };
}

export async function createLocation(
  _prevState: CatalogActionResult,
  formData: FormData,
): Promise<CatalogActionResult> {
  const name = formData.get("name")?.toString().trim();
  if (!name) {
    return { error: "Enter a location name" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("locations").insert({ name });

  if (error) {
    return { error: error.code === UNIQUE_VIOLATION ? `"${name}" is already a location` : error.message };
  }

  revalidatePath("/shifts/new");
  refresh();
  return { success: true };
}

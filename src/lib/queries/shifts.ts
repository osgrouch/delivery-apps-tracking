import { createClient } from "@/lib/supabase/server";
import type { App, ShiftWithApp } from "@/types/database.types";

export async function getApps(): Promise<App[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("apps").select("*").order("name");

  if (error) {
    throw new Error(`Failed to load apps: ${error.message}`);
  }

  return data;
}

export interface ShiftFilters {
  from?: string;
  to?: string;
}

export async function getShifts(filters: ShiftFilters = {}): Promise<ShiftWithApp[]> {
  const supabase = await createClient();
  let query = supabase
    .from("shifts")
    .select("*, app:apps(id, name)")
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (filters.from) {
    query = query.gte("date", filters.from);
  }
  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load shifts: ${error.message}`);
  }

  return data as unknown as ShiftWithApp[];
}

export async function getShiftById(id: string): Promise<ShiftWithApp | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .select("*, app:apps(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load shift ${id}: ${error.message}`);
  }

  return data as unknown as ShiftWithApp | null;
}

/**
 * One-time import of historical shift data from scripts/data/shifts.json
 * into Supabase. Uses the service role key (bypasses RLS) since this runs
 * outside any authenticated user session. Safe to re-run: shifts are
 * upserted by id.
 *
 * Usage: npm run import:shifts
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { TIME_RE } from "../src/lib/validation/shift";
import type { Database } from "../src/types/database.types";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const rawShiftSchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(),
  start: z.string().regex(TIME_RE),
  end: z.string().regex(TIME_RE),
  earnings: z.number().nonnegative(),
  mileage: z.number().nonnegative(),
  trips: z.number().int().nonnegative(),
  hours: z.number().positive(),
  app: z.string().min(1),
});

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running the import.",
    );
  }

  const dataPath = path.resolve(process.cwd(), "scripts/data/shifts.json");
  const raw: unknown = JSON.parse(readFileSync(dataPath, "utf-8"));

  if (!Array.isArray(raw)) {
    throw new Error(`Expected an array of shifts in ${dataPath}`);
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

  const { data: apps, error: appsError } = await supabase.from("apps").select("id, name");
  if (appsError) {
    throw new Error(`Failed to load apps: ${appsError.message}`);
  }

  const appIdByName = new Map(apps.map((app) => [app.name, app.id]));

  let imported = 0;
  let skipped = 0;
  const issues: string[] = [];

  for (const [index, entry] of raw.entries()) {
    const parsed = rawShiftSchema.safeParse(entry);
    if (!parsed.success) {
      skipped++;
      issues.push(`Row ${index}: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
      continue;
    }

    const appId = appIdByName.get(parsed.data.app);
    if (!appId) {
      skipped++;
      issues.push(`Row ${index}: unknown app "${parsed.data.app}" — add it to the apps table first`);
      continue;
    }

    const { error } = await supabase.from("shifts").upsert(
      {
        id: parsed.data.id,
        app_id: appId,
        date: parsed.data.date,
        start_time: parsed.data.start,
        end_time: parsed.data.end,
        earnings: parsed.data.earnings,
        mileage: parsed.data.mileage,
        trips: parsed.data.trips,
        hours: parsed.data.hours,
      },
      { onConflict: "id" },
    );

    if (error) {
      skipped++;
      issues.push(`Row ${index} (${parsed.data.id}): ${error.message}`);
      continue;
    }

    imported++;
  }

  console.log(`Imported ${imported} shift(s), skipped ${skipped}.`);
  if (issues.length > 0) {
    console.log("\nIssues:");
    for (const issue of issues) {
      console.log(`  - ${issue}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

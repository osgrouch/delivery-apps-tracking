import Link from "next/link";

import { AppTotalsCard } from "@/components/shifts/AppTotalsCard";
import { ShiftTable } from "@/components/shifts/ShiftTable";
import { getApps, getShifts } from "@/lib/queries/shifts";
import { aggregateTotalsByApp } from "@/lib/utils/aggregate";

export default async function ShiftsPage() {
  const [shifts, apps] = await Promise.all([getShifts(), getApps()]);
  const totalsByApp = aggregateTotalsByApp(shifts, apps);
  const colorByAppId = new Map(apps.map((app) => [app.id, app.color]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Shifts</h1>
        <Link
          href="/shifts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add shifts
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-secondary-foreground">All Time Stats</h2>
        <div className="flex gap-4 overflow-x-auto border border-border p-4">
          {totalsByApp.map((totals) => (
            <AppTotalsCard key={totals.appId} totals={totals} color={colorByAppId.get(totals.appId) ?? "#64748b"} />
          ))}
        </div>
      </div>

      <ShiftTable shifts={shifts} apps={apps} />
    </div>
  );
}

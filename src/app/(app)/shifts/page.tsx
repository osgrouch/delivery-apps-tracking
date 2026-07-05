import Link from "next/link";

import { ShiftTable } from "@/components/shifts/ShiftTable";
import { getApps, getShifts } from "@/lib/queries/shifts";

export default async function ShiftsPage() {
  const [shifts, apps] = await Promise.all([getShifts(), getApps()]);

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
      <ShiftTable shifts={shifts} apps={apps} />
    </div>
  );
}

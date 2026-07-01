import Link from "next/link";

import { ShiftTable } from "@/components/shifts/ShiftTable";
import { getShifts } from "@/lib/queries/shifts";

export default async function ShiftsPage() {
  const shifts = await getShifts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Shifts</h1>
        <Link
          href="/shifts/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Add shift
        </Link>
      </div>
      <ShiftTable shifts={shifts} />
    </div>
  );
}

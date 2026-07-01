import { ShiftForm } from "@/components/shifts/ShiftForm";
import { createShift } from "@/lib/actions/shifts";
import { getApps } from "@/lib/queries/shifts";

export default async function NewShiftPage() {
  const apps = await getApps();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Add shift</h1>
      <ShiftForm apps={apps} action={createShift} submitLabel="Add shift" />
    </div>
  );
}

import { notFound } from "next/navigation";

import { ShiftForm } from "@/components/shifts/ShiftForm";
import { updateShift } from "@/lib/actions/shifts";
import { getApps, getShiftById } from "@/lib/queries/shifts";

export default async function EditShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [apps, shift] = await Promise.all([getApps(), getShiftById(id)]);

  if (!shift) {
    notFound();
  }

  const updateShiftWithId = updateShift.bind(null, shift.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Edit shift</h1>
      <ShiftForm
        apps={apps}
        action={updateShiftWithId}
        defaultValues={shift}
        submitLabel="Save changes"
      />
    </div>
  );
}

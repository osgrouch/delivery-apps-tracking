import { AddShiftsTabs } from "@/components/shifts/AddShiftsTabs";
import { getApps } from "@/lib/queries/shifts";

export default async function NewShiftPage() {
  const apps = await getApps();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Add shifts</h1>
      <AddShiftsTabs apps={apps} />
    </div>
  );
}

import { AddShiftsTabs } from "@/components/shifts/AddShiftsTabs";
import { ManageCatalogPanel } from "@/components/shifts/ManageCatalogPanel";
import { getApps, getLocations } from "@/lib/queries/shifts";

export default async function NewShiftPage() {
  const [apps, locations] = await Promise.all([getApps(), getLocations()]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <h1 className="text-2xl font-semibold text-foreground">Add shifts</h1>
        <AddShiftsTabs apps={apps} locations={locations} />
      </div>

      <ManageCatalogPanel apps={apps} locations={locations} />
    </div>
  );
}

import { QuickAddForm } from "@/components/shifts/QuickAddForm";
import { createApp, createLocation } from "@/lib/actions/catalog";
import type { App, Location } from "@/types/database.types";

const chipClasses = "rounded-full border border-border px-2 py-0.5 text-xs text-foreground";

export function ManageCatalogPanel({ apps, locations }: { apps: App[]; locations: Location[] }) {
  return (
    <div className="flex w-full flex-col gap-6 lg:w-72">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-secondary-foreground">Apps</h2>
        <div className="flex flex-wrap gap-1.5">
          {apps.map((app) => (
            <span key={app.id} className={chipClasses} style={{ borderColor: app.color }}>
              {app.name}
            </span>
          ))}
        </div>
        <QuickAddForm action={createApp} placeholder="e.g. Grubhub" submitLabel="Add app" withColor />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-secondary-foreground">Locations</h2>
        <div className="flex flex-wrap gap-1.5">
          {locations.map((location) => (
            <span key={location.id} className={chipClasses}>
              {location.name}
            </span>
          ))}
        </div>
        <QuickAddForm action={createLocation} placeholder="e.g. Buffalo, NY" submitLabel="Add location" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import { BulkShiftForm } from "@/components/shifts/BulkShiftForm";
import { ShiftForm } from "@/components/shifts/ShiftForm";
import { createShift } from "@/lib/actions/shifts";
import type { App } from "@/types/database.types";

type Tab = "bulk" | "single";

function tabClasses(active: boolean): string {
  return active
    ? "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
    : "rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900";
}

export function AddShiftsTabs({ apps }: { apps: App[] }) {
  const [tab, setTab] = useState<Tab>("bulk");

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bulk"}
          className={tabClasses(tab === "bulk")}
          onClick={() => setTab("bulk")}
        >
          Bulk paste
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "single"}
          className={tabClasses(tab === "single")}
          onClick={() => setTab("single")}
        >
          Single shift
        </button>
      </div>

      {tab === "bulk" ? (
        <div className="flex flex-col gap-4">
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Paste one or more shifts. Each shift needs an app, earnings, mileage, trip count, and a
            start-end time range on its own line. A date line applies to every shift after it until
            a new date is given.
          </p>
          <BulkShiftForm apps={apps} />
        </div>
      ) : (
        <ShiftForm apps={apps} action={createShift} submitLabel="Add shift" />
      )}
    </div>
  );
}

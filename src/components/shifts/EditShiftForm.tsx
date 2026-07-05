"use client";

import { useActionState, useEffect } from "react";

import { AppSelectField, EarningsField, MileageField, TripsField } from "@/components/shifts/ShiftForm";
import { ShiftDateCalendar } from "@/components/shifts/ShiftDateCalendar";
import { TimeSpinner } from "@/components/ui/TimeSpinner";
import type { ShiftActionResult } from "@/lib/actions/shifts";
import type { App, ShiftWithApp } from "@/types/database.types";

type ShiftDefaults = Pick<
  ShiftWithApp,
  "app_id" | "date" | "start_time" | "end_time" | "earnings" | "mileage" | "trips"
>;

interface EditShiftFormProps {
  apps: App[];
  action: (prevState: ShiftActionResult, formData: FormData) => Promise<ShiftActionResult>;
  defaultValues: ShiftDefaults;
  submitLabel?: string;
  onSuccess?: () => void;
}

const initialState: ShiftActionResult = {};

export function EditShiftForm({
  apps,
  action,
  defaultValues,
  submitLabel = "Save changes",
  onSuccess,
}: EditShiftFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <ShiftDateCalendar name="date" defaultValue={defaultValues.date} label="Date" />
            {state.fieldErrors?.date?.length ? (
              <p className="text-xs text-destructive" role="alert">
                {state.fieldErrors.date[0]}
              </p>
            ) : null}
          </div>

          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-secondary-foreground">Start time</span>
              <TimeSpinner name="startTime" defaultValue={defaultValues.start_time.slice(0, 5)} />
              {state.fieldErrors?.startTime?.length ? (
                <p className="text-xs text-destructive" role="alert">
                  {state.fieldErrors.startTime[0]}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-secondary-foreground">End time</span>
              <TimeSpinner name="endTime" defaultValue={defaultValues.end_time.slice(0, 5)} />
              {state.fieldErrors?.endTime?.length ? (
                <p className="text-xs text-destructive" role="alert">
                  {state.fieldErrors.endTime[0]}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <AppSelectField apps={apps} defaultValue={defaultValues.app_id} errors={state.fieldErrors?.appId} />
          <EarningsField defaultValue={defaultValues.earnings} errors={state.fieldErrors?.earnings} />
          <MileageField defaultValue={defaultValues.mileage} errors={state.fieldErrors?.mileage} />
          <TripsField defaultValue={defaultValues.trips} errors={state.fieldErrors?.trips} />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

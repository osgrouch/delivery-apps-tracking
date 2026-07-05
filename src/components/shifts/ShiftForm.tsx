"use client";

import { useActionState, useEffect } from "react";

import type { ShiftActionResult } from "@/lib/actions/shifts";
import type { App, ShiftWithApp } from "@/types/database.types";

type ShiftDefaults = Pick<
  ShiftWithApp,
  "app_id" | "date" | "start_time" | "end_time" | "earnings" | "mileage" | "trips"
>;

interface ShiftFormProps {
  apps: App[];
  action: (prevState: ShiftActionResult, formData: FormData) => Promise<ShiftActionResult>;
  defaultValues?: ShiftDefaults;
  submitLabel?: string;
  /** Called when the action resolves with `success: true` (used by actions that don't redirect, e.g. modal edits). */
  onSuccess?: () => void;
}

const initialState: ShiftActionResult = {};

const inputClasses =
  "rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function Field({
  label,
  htmlFor,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-secondary-foreground">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p className="text-xs text-destructive" role="alert">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

interface ShiftFieldProps {
  defaultValue?: number;
  errors?: string[];
}

/** Field building blocks shared by ShiftForm and EditShiftForm, since each arranges them into a different layout. */
export function AppSelectField({
  apps,
  defaultValue,
  errors,
}: ShiftFieldProps & { apps: App[] }) {
  return (
    <Field label="App" htmlFor="appId" errors={errors}>
      <select id="appId" name="appId" required defaultValue={defaultValue ?? ""} className={inputClasses}>
        <option value="" disabled>
          Select an app
        </option>
        {apps.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function EarningsField({ defaultValue, errors }: ShiftFieldProps) {
  return (
    <Field label="Earnings ($)" htmlFor="earnings" errors={errors}>
      <input
        id="earnings"
        name="earnings"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={defaultValue}
        className={inputClasses}
      />
    </Field>
  );
}

export function MileageField({ defaultValue, errors }: ShiftFieldProps) {
  return (
    <Field label="Mileage" htmlFor="mileage" errors={errors}>
      <input
        id="mileage"
        name="mileage"
        type="number"
        step="0.1"
        min="0"
        required
        defaultValue={defaultValue}
        className={inputClasses}
      />
    </Field>
  );
}

export function TripsField({ defaultValue, errors }: ShiftFieldProps) {
  return (
    <Field label="Trips" htmlFor="trips" errors={errors}>
      <input
        id="trips"
        name="trips"
        type="number"
        step="1"
        min="0"
        required
        defaultValue={defaultValue}
        className={inputClasses}
      />
    </Field>
  );
}

export function ShiftForm({
  apps,
  action,
  defaultValues,
  submitLabel = "Save shift",
  onSuccess,
}: ShiftFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess?.();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <AppSelectField apps={apps} defaultValue={defaultValues?.app_id} errors={state.fieldErrors?.appId} />

      <Field label="Date" htmlFor="date" errors={state.fieldErrors?.date}>
        <input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={defaultValues?.date}
          className={inputClasses}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start time" htmlFor="startTime" errors={state.fieldErrors?.startTime}>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            defaultValue={defaultValues?.start_time?.slice(0, 5)}
            className={inputClasses}
          />
        </Field>
        <Field label="End time" htmlFor="endTime" errors={state.fieldErrors?.endTime}>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            defaultValue={defaultValues?.end_time?.slice(0, 5)}
            className={inputClasses}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <EarningsField defaultValue={defaultValues?.earnings} errors={state.fieldErrors?.earnings} />
        <MileageField defaultValue={defaultValues?.mileage} errors={state.fieldErrors?.mileage} />
      </div>

      <TripsField defaultValue={defaultValues?.trips} errors={state.fieldErrors?.trips} />

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

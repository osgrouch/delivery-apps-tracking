"use client";

import { useActionState } from "react";

import type { ShiftActionResult } from "@/lib/actions/shifts";
import type { App, ShiftWithApp } from "@/types/database.types";

type ShiftDefaults = Pick<
  ShiftWithApp,
  "app_id" | "date" | "start_time" | "end_time" | "earnings" | "mileage" | "trips" | "hours"
>;

interface ShiftFormProps {
  apps: App[];
  action: (prevState: ShiftActionResult, formData: FormData) => Promise<ShiftActionResult>;
  defaultValues?: ShiftDefaults;
  submitLabel?: string;
}

const initialState: ShiftActionResult = {};

const inputClasses =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

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
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p className="text-xs text-red-600" role="alert">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function ShiftForm({ apps, action, defaultValues, submitLabel = "Save shift" }: ShiftFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <Field label="App" htmlFor="appId" errors={state.fieldErrors?.appId}>
        <select
          id="appId"
          name="appId"
          required
          defaultValue={defaultValues?.app_id ?? ""}
          className={inputClasses}
        >
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
        <Field label="Earnings ($)" htmlFor="earnings" errors={state.fieldErrors?.earnings}>
          <input
            id="earnings"
            name="earnings"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.earnings}
            className={inputClasses}
          />
        </Field>
        <Field label="Mileage" htmlFor="mileage" errors={state.fieldErrors?.mileage}>
          <input
            id="mileage"
            name="mileage"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={defaultValues?.mileage}
            className={inputClasses}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Trips" htmlFor="trips" errors={state.fieldErrors?.trips}>
          <input
            id="trips"
            name="trips"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={defaultValues?.trips}
            className={inputClasses}
          />
        </Field>
        <Field label="Hours" htmlFor="hours" errors={state.fieldErrors?.hours}>
          <input
            id="hours"
            name="hours"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={defaultValues?.hours}
            className={inputClasses}
          />
        </Field>
      </div>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

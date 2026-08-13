"use client";

import { useState, useTransition } from "react";

import { bulkCreateShifts } from "@/lib/actions/shifts";
import { parseBulkShiftsText, type ParsedShift } from "@/lib/parsing/bulkShifts";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { App, Location } from "@/types/database.types";

const textareaClasses =
  "min-h-[16rem] w-full rounded-md border border-border bg-input px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary";

const selectClasses =
  "rounded-md border border-border bg-input px-2 py-1 text-sm text-foreground outline-none focus:border-primary";

export function BulkShiftForm({ apps, locations }: { apps: App[]; locations: Location[] }) {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<{ lineNumber: number; message: string }[]>([]);
  const [shifts, setShifts] = useState<ParsedShift[] | null>(null);
  const [promptLocationId, setPromptLocationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleParse() {
    const parsed = parseBulkShiftsText(text, apps, locations);
    setIssues(parsed.issues);
    setShifts(parsed.shifts);
    setPromptLocationId("");
    setError(null);
  }

  function handleBack() {
    setShifts(null);
    setIssues([]);
    setPromptLocationId("");
    setError(null);
  }

  function updateShiftLocation(index: number, locationId: number | null) {
    const locationName = locations.find((location) => location.id === locationId)?.name ?? null;
    setShifts((current) =>
      current ? current.map((shift, i) => (i === index ? { ...shift, locationId, locationName } : shift)) : current,
    );
  }

  function applyLocationToMissing() {
    if (!promptLocationId) return;
    const locationId = Number(promptLocationId);
    const location = locations.find((l) => l.id === locationId);
    if (!location) return;
    setShifts((current) =>
      current
        ? current.map((shift) =>
            shift.locationId === null ? { ...shift, locationId, locationName: location.name } : shift,
          )
        : current,
    );
    setPromptLocationId("");
  }

  function handleConfirm() {
    if (!shifts || shifts.length === 0) return;
    startTransition(async () => {
      const res = await bulkCreateShifts(shifts);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  if (!shifts) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"6/30\nRochester, NY\nUberEats\n142.50\n38.2\n12\n930-1400"}
          className={textareaClasses}
        />
        <button
          type="button"
          onClick={handleParse}
          disabled={text.trim().length === 0}
          className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Parse shifts
        </button>
      </div>
    );
  }

  const hasIssues = issues.length > 0;
  const missingLocationCount = shifts.filter((shift) => shift.locationId === null).length;

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {hasIssues ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
          <p className="mb-2 text-sm font-medium text-destructive">Fix these issues and re-parse:</p>
          <ul className="list-inside list-disc text-sm text-destructive">
            {issues.map((issue, idx) => (
              <li key={idx}>
                Line {issue.lineNumber}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {missingLocationCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-secondary/20 p-3">
          <p className="text-sm text-muted-foreground">
            {missingLocationCount} shift{missingLocationCount === 1 ? "" : "s"}{" "}
            {missingLocationCount === 1 ? "has" : "have"} no location.
          </p>
          <select
            value={promptLocationId}
            onChange={(e) => setPromptLocationId(e.target.value)}
            className={selectClasses}
          >
            <option value="">Select a location…</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyLocationToMissing}
            disabled={!promptLocationId}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Apply to shifts without a location
          </button>
        </div>
      ) : null}

      {shifts.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">App</th>
                <th className="px-4 py-2 font-medium">Location</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 text-right font-medium">Earnings</th>
                <th className="px-4 py-2 text-right font-medium">Miles</th>
                <th className="px-4 py-2 text-right font-medium">Trips</th>
                <th className="px-4 py-2 text-right font-medium">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shifts.map((shift, idx) => (
                <tr key={idx}>
                  <td className="whitespace-nowrap px-4 py-2">{formatDate(shift.date)}</td>
                  <td className="px-4 py-2">{shift.appName}</td>
                  <td className="px-4 py-2">
                    <select
                      value={shift.locationId ?? ""}
                      onChange={(e) =>
                        updateShiftLocation(idx, e.target.value === "" ? null : Number(e.target.value))
                      }
                      className={selectClasses}
                    >
                      <option value="">No location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {shift.startTime}–{shift.endTime}
                  </td>
                  <td className="px-4 py-2 text-right">{formatCurrency(shift.earnings)}</td>
                  <td className="px-4 py-2 text-right">{shift.mileage}</td>
                  <td className="px-4 py-2 text-right">{shift.trips}</td>
                  <td className="px-4 py-2 text-right">{shift.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No shifts were recognized in the pasted text.</p>
      )}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary"
        >
          Back to edit
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={hasIssues || shifts.length === 0 || isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : `Confirm & save ${shifts.length} shift${shifts.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}

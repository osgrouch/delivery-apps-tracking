"use client";

import { ChevronDown, Eye } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

import { DeleteShiftButton } from "@/components/shifts/DeleteShiftButton";
import { EditShiftModal } from "@/components/shifts/EditShiftModal";
import { ShiftCard } from "@/components/weekly/ShiftCard";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils/format";
import type { App, ShiftWithApp } from "@/types/database.types";

type SortOption =
  | "date-desc"
  | "date-asc"
  | "earnings-desc"
  | "earnings-asc"
  | "hours-desc"
  | "hours-asc"
  | "miles-desc"
  | "miles-asc"
  | "trips-desc"
  | "trips-asc";

const SORT_LABELS: Record<SortOption, string> = {
  "date-desc": "Date (Newest first)",
  "date-asc": "Date (Oldest first)",
  "earnings-desc": "Earnings (High to Low)",
  "earnings-asc": "Earnings (Low to High)",
  "hours-desc": "Hours (High to Low)",
  "hours-asc": "Hours (Low to High)",
  "miles-desc": "Miles (High to Low)",
  "miles-asc": "Miles (Low to High)",
  "trips-desc": "Trips (High to Low)",
  "trips-asc": "Trips (Low to High)",
};

const SORT_COMPARATORS: Record<SortOption, (a: ShiftWithApp, b: ShiftWithApp) => number> = {
  "date-desc": (a, b) => b.date.localeCompare(a.date),
  "date-asc": (a, b) => a.date.localeCompare(b.date),
  "earnings-desc": (a, b) => b.earnings - a.earnings,
  "earnings-asc": (a, b) => a.earnings - b.earnings,
  "hours-desc": (a, b) => b.hours - a.hours,
  "hours-asc": (a, b) => a.hours - b.hours,
  "miles-desc": (a, b) => b.mileage - a.mileage,
  "miles-asc": (a, b) => a.mileage - b.mileage,
  "trips-desc": (a, b) => b.trips - a.trips,
  "trips-asc": (a, b) => a.trips - b.trips,
};

const selectClasses =
  "rounded-md border border-border bg-input px-2 py-1 text-sm text-foreground outline-none focus:border-primary";

interface AllTimeShiftTableProps {
  shifts: ShiftWithApp[];
  apps: App[];
  colorByAppId: Map<number, string>;
}

export function AllTimeShiftTable({ shifts, apps, colorByAppId }: AllTimeShiftTableProps) {
  const [appFilter, setAppFilter] = useState<"all" | number>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const visibleShifts = useMemo(() => {
    const filtered = shifts.filter((shift) => {
      if (appFilter !== "all" && shift.app.id !== appFilter) return false;
      if (fromDate && shift.date < fromDate) return false;
      if (toDate && shift.date > toDate) return false;
      return true;
    });
    return filtered.sort(SORT_COMPARATORS[sortOption]);
  }, [shifts, appFilter, fromDate, toDate, sortOption]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          App
          <select
            value={appFilter}
            onChange={(event) =>
              setAppFilter(event.target.value === "all" ? "all" : Number(event.target.value))
            }
            className={selectClasses}
          >
            <option value="all">All Apps</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className={selectClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          To
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className={selectClasses}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Sort by
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            className={selectClasses}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        {visibleShifts.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No shifts match these filters.</p>
        ) : (
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">App</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 text-right font-medium">Hours</th>
                <th className="px-4 py-2 text-right font-medium">Earnings</th>
                <th className="px-4 py-2 text-right font-medium">Miles</th>
                <th className="px-4 py-2 text-right font-medium">Trips</th>
                <th className="px-4 py-2 font-medium" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleShifts.map((shift) => {
                const isOpen = expandedId === shift.id;
                return (
                  <Fragment key={shift.id}>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2">{formatDate(shift.date)}</td>
                      <td className="px-4 py-2">{shift.app.name}</td>
                      <td className="whitespace-nowrap px-4 py-2">
                        {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                      </td>
                      <td className="px-4 py-2 text-right">{formatDuration(shift.hours)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(shift.earnings)}</td>
                      <td className="px-4 py-2 text-right">{shift.mileage}</td>
                      <td className="px-4 py-2 text-right">{shift.trips}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(shift.id)}
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                          <EditShiftModal shift={shift} apps={apps} variant="text" />
                          <DeleteShiftButton id={shift.id} />
                          <button
                            type="button"
                            onClick={() => toggleExpanded(shift.id)}
                            aria-label={isOpen ? "Collapse preview" : "Expand preview"}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr>
                        <td colSpan={8} className="bg-secondary/20 p-4">
                          <div className="flex justify-center">
                            <ShiftCard
                              shift={shift}
                              color={colorByAppId.get(shift.app.id) ?? "#64748b"}
                              apps={apps}
                            />
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

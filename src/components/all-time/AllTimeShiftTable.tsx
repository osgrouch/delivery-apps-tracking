"use client";

import { ChevronDown, Eye } from "lucide-react";
import { Fragment, useState } from "react";

import { SORT_LABELS, type SortOption } from "@/components/all-time/useAllTimeFocusData";
import { DeleteShiftButton } from "@/components/shifts/DeleteShiftButton";
import { EditShiftModal } from "@/components/shifts/EditShiftModal";
import { ShiftCard } from "@/components/weekly/ShiftCard";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils/format";
import type { App, Location, ShiftWithApp } from "@/types/database.types";

const selectClasses =
  "rounded-md border border-border bg-input px-2 py-1 text-sm text-foreground outline-none focus:border-primary";

interface AllTimeShiftTableProps {
  visibleShifts: ShiftWithApp[];
  apps: App[];
  locations: Location[];
  colorByAppId: Map<number, string>;
  appFilter: "all" | number;
  setAppFilter: (value: "all" | number) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
}

export function AllTimeShiftTable({
  visibleShifts,
  apps,
  locations,
  colorByAppId,
  appFilter,
  setAppFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sortOption,
  setSortOption,
}: AllTimeShiftTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

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

      <div className="@container min-h-0 flex-1 overflow-auto rounded-xl border border-border">
        {visibleShifts.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No shifts match these filters.</p>
        ) : (
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-muted-foreground">
              <tr>
                  <th className="px-4 py-2 font-medium" aria-label="Preview" />
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">App</th>
                <th className="px-4 py-2 font-medium">Location</th>
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
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(shift.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">{formatDate(shift.date)}</td>
                      <td className="px-4 py-2">{shift.app.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{shift.location?.name ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2">
                        {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                      </td>
                      <td className="px-4 py-2 text-right">{formatDuration(shift.hours)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(shift.earnings)}</td>
                      <td className="px-4 py-2 text-right">{shift.mileage}</td>
                      <td className="px-4 py-2 text-right">{shift.trips}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <EditShiftModal shift={shift} apps={apps} locations={locations} variant="text" />
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
                    <tr>
                      <td colSpan={10} className="p-0">
                        <div
                          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                        >
                          <div className="overflow-hidden">
                            <div className="sticky left-0 w-[100cqw] bg-secondary/20 p-4">
                              <div className="flex justify-center">
                                <ShiftCard
                                  shift={shift}
                                  color={colorByAppId.get(shift.app.id) ?? "#64748b"}
                                  apps={apps}
                                  locations={locations}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
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

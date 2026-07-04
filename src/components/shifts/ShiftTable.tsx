import Link from "next/link";

import { DeleteShiftButton } from "@/components/shifts/DeleteShiftButton";
import { deriveShiftMetrics } from "@/lib/utils/aggregate";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { ShiftWithApp } from "@/types/database.types";

export function ShiftTable({ shifts }: { shifts: ShiftWithApp[] }) {
  if (shifts.length === 0) {
    return <p className="text-sm text-muted-foreground">No shifts yet. Add your first one above.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-border bg-secondary/40 text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Date</th>
            <th className="px-4 py-2 font-medium">App</th>
            <th className="px-4 py-2 font-medium">Time</th>
            <th className="px-4 py-2 text-right font-medium">Earnings</th>
            <th className="px-4 py-2 text-right font-medium">$/hr</th>
            <th className="px-4 py-2 text-right font-medium">Miles</th>
            <th className="px-4 py-2 text-right font-medium">Trips</th>
            <th className="px-4 py-2 font-medium" aria-label="Actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {shifts.map((shift) => {
            const { dollarsPerHour } = deriveShiftMetrics(shift);
            return (
              <tr key={shift.id}>
                <td className="whitespace-nowrap px-4 py-2">{formatDate(shift.date)}</td>
                <td className="px-4 py-2">{shift.app.name}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                </td>
                <td className="px-4 py-2 text-right">{formatCurrency(shift.earnings)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(dollarsPerHour)}</td>
                <td className="px-4 py-2 text-right">{shift.mileage}</td>
                <td className="px-4 py-2 text-right">{shift.trips}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/shifts/${shift.id}/edit`}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <DeleteShiftButton id={shift.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

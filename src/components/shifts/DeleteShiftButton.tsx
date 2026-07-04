"use client";

import { useTransition } from "react";

import { deleteShift } from "@/lib/actions/shifts";

export function DeleteShiftButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Delete this shift? This can't be undone.")) return;
        startTransition(() => {
          void deleteShift(id);
        });
      }}
      className="text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

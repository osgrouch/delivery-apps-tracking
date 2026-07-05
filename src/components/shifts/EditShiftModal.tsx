"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { EditShiftForm } from "@/components/shifts/EditShiftForm";
import { Modal } from "@/components/ui/Modal";
import { updateShiftInPlace } from "@/lib/actions/shifts";
import type { App, ShiftWithApp } from "@/types/database.types";

interface EditShiftModalProps {
  shift: ShiftWithApp;
  apps: App[];
  /** "icon" is a bare pencil button (shift cards); "text" is a plain "Edit" link-style button (table rows). */
  variant?: "icon" | "text";
}

export function EditShiftModal({ shift, apps, variant = "icon" }: EditShiftModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={variant === "icon" ? "Edit shift" : undefined}
        className={
          variant === "icon"
            ? "rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            : "text-sm text-muted-foreground hover:text-foreground"
        }
      >
        {variant === "icon" ? <Pencil size={14} /> : "Edit"}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Shift" maxWidthClassName="max-w-2xl">
        <EditShiftForm
          apps={apps}
          action={updateShiftInPlace.bind(null, shift.id)}
          defaultValues={shift}
          submitLabel="Save changes"
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

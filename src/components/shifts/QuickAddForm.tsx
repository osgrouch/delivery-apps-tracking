"use client";

import { useActionState, useEffect, useRef } from "react";

import type { CatalogActionResult } from "@/lib/actions/catalog";

const initialState: CatalogActionResult = {};

interface QuickAddFormProps {
  action: (prevState: CatalogActionResult, formData: FormData) => Promise<CatalogActionResult>;
  placeholder: string;
  submitLabel: string;
  /** Renders a color-picker input alongside the name field (for apps, which have a `color` column). */
  withColor?: boolean;
}

export function QuickAddForm({ action, placeholder, submitLabel, withColor = false }: QuickAddFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        {withColor ? (
          <input
            name="color"
            type="color"
            defaultValue="#64748b"
            aria-label="Color"
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-input p-0.5"
          />
        ) : null}
        <input
          name="name"
          type="text"
          required
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Adding…" : submitLabel}
        </button>
      </div>
      {state.error ? (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

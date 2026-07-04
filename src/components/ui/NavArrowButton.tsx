interface NavArrowButtonProps {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Shared prev/next arrow button for the weekly/monthly chart date-range navigation. */
export function NavArrowButton({ direction, label, onClick, disabled }: NavArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md border border-border px-2 py-1 hover:bg-secondary disabled:opacity-50"
    >
      {direction === "prev" ? "←" : "→"}
    </button>
  );
}

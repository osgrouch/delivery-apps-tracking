"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface NumberSpinnerProps {
  value: number;
  digits?: number;
  ariaLabel: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onCommitText: (parsed: number) => void;
  /** Overrides the default zero-padded digit display (e.g. rendering a month name instead). */
  formatValue?: (value: number) => string;
  /** Overrides the default digit-only parsing; return null to reject the input and revert. */
  parseText?: (text: string) => number | null;
  /** Input width in `ch` units; defaults to `digits`. Widen for a formatValue like month names. */
  widthCh?: number;
}

const defaultFormat = (value: number, digits: number) => String(value).padStart(digits, "0");
const defaultParse = (text: string): number | null => {
  const parsed = Number(text);
  return text.trim() !== "" && Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

/** Up/down arrows plus a directly-editable display, shared by TimeSpinner, MonthSpinner, and the calendar's year field. */
export function NumberSpinner({
  value,
  digits = 2,
  ariaLabel,
  onIncrement,
  onDecrement,
  onCommitText,
  formatValue,
  parseText,
  widthCh,
}: NumberSpinnerProps) {
  const format = formatValue ?? ((v: number) => defaultFormat(v, digits));
  const parse = parseText ?? defaultParse;
  const isFreeText = formatValue !== undefined;

  const [text, setText] = useState(() => format(value));
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(format(value));
  }

  function commit() {
    const parsed = parse(text);
    if (parsed !== null) {
      onCommitText(parsed);
    } else {
      setText(format(value));
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onIncrement}
        aria-label={`Increase ${ariaLabel}`}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronUp size={14} />
      </button>
      <input
        type="text"
        inputMode={isFreeText ? undefined : "numeric"}
        value={text}
        onChange={(event) =>
          setText(isFreeText ? event.target.value : event.target.value.replace(/\D/g, "").slice(0, digits))
        }
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        aria-label={ariaLabel}
        style={{ width: `${widthCh ?? digits}ch` }}
        className="bg-transparent text-center font-mono text-lg font-medium text-foreground outline-none focus:text-primary"
      />
      <button
        type="button"
        onClick={onDecrement}
        aria-label={`Decrease ${ariaLabel}`}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronDown size={14} />
      </button>
    </div>
  );
}

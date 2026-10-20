"use client";

import { useState } from "react";

import { fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * A plain number box that commits every valid value as it is typed but lets the user
 * pass through "-" or an empty field on the way to one. Resyncs from props when not focused.
 */
export const NumberInput = ({ value, onChange, label, min, max, className }: Props) => {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  // The value the text was last derived from; a prop change while unfocused resyncs the text.
  const [synced, setSynced] = useState(value);
  if (!focused && synced !== value) {
    setSynced(value);
    setText(String(value));
  }

  const commit = (raw: string) => {
    setText(raw);
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      aria-label={label}
      value={text}
      onChange={e => commit(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setText(String(value));
      }}
      className={cn(fieldClass, "w-full px-2 py-1.5 font-mono", className)}
    />
  );
};

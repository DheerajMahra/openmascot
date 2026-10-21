"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  className?: string;
}

/** Hides the browser's spinner arrows, which every engine draws differently. */
export const noSpinnerClass =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/**
 * A number box with − and + on either side. It commits every valid value as it is typed but
 * lets the user pass through "-" or an empty field on the way to one. Resyncs from props when not focused.
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

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));

  const commit = (raw: string) => {
    setText(raw);
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    const clamped = clamp(n);
    if (clamped !== value) onChange(clamped);
  };

  const step = (by: number) => {
    const next = clamp(value + by);
    if (next !== value) onChange(next);
  };

  // The steppers skip the tab order: the box itself takes arrow keys, and a table of these
  // would otherwise cost three tab stops per cell.
  return (
    <InputGroup aria-label={label} className={cn("h-7", className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          size="icon-xs"
          className="size-5"
          tabIndex={-1}
          aria-label="Decrease"
          disabled={min !== undefined && value <= min}
          onClick={() => step(-1)}
        >
          <MinusIcon />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
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
        className={cn("h-full px-0 text-center font-mono", noSpinnerClass)}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          className="size-5"
          tabIndex={-1}
          aria-label="Increase"
          disabled={max !== undefined && value >= max}
          onClick={() => step(1)}
        >
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

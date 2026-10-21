"use client";

import type { TriggerKind } from "@/lib/presets";
import type { KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { noSpinnerClass } from "@/components/ui/number-input";
import { buildTrigger } from "@/lib/presets";
import { cn } from "@/lib/utils";

interface Props {
  number: number;
  triggerKey: string;
  kind: TriggerKind | null;
  param: string;
  /** Called with the rebuilt trigger key once the user leaves the field. */
  onCommit: (key: string) => void;
}

const blurOnEnter = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") e.currentTarget.blur();
};

/**
 * The "Detail" cell: seconds for an interval, an event name for a custom trigger, else a dash.
 * Uncontrolled and keyed by the trigger, so it commits on blur without fighting the store.
 */
export const TriggerDetailField = ({ number: n, triggerKey, kind, param, onCommit }: Props) => {
  if (kind === "interval") {
    return (
      <InputGroup className="h-7">
        <InputGroupInput
          type="number"
          min={1}
          max={600}
          aria-label={`Seconds, trigger ${n}`}
          key={triggerKey}
          defaultValue={param || "8"}
          onBlur={e => {
            const secs = Math.max(1, parseInt(e.target.value, 10) || 8);
            onCommit(buildTrigger("interval", String(secs)));
          }}
          onKeyDown={blurOnEnter}
          className={cn("h-full font-mono", noSpinnerClass)}
        />
        <InputGroupAddon align="inline-end" className="font-mono text-xs font-normal">
          s
        </InputGroupAddon>
      </InputGroup>
    );
  }

  if (kind === "custom") {
    return (
      <Input
        type="text"
        aria-label={`Event name, trigger ${n}`}
        key={triggerKey}
        defaultValue={param}
        onBlur={e => {
          const name = e.target.value.trim().replace(/\s+/g, "-");
          if (name && name !== param) onCommit(buildTrigger("custom", name));
          else e.target.value = param;
        }}
        onKeyDown={blurOnEnter}
        className="h-7 font-mono"
      />
    );
  }

  return (
    <span aria-hidden="true" className="pl-2 font-mono text-[13px] text-stage-text">
      —
    </span>
  );
};

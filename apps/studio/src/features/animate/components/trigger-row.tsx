"use client";

import type { TriggerKind } from "@/lib/presets";

import { XIcon } from "lucide-react";

import { GridTableRow } from "@/components/ui/grid-table";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { TriggerDetailField } from "@/features/animate/components/trigger-detail-field";
import { useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { TRIGGER_KINDS, parseTrigger, uniqueTrigger } from "@/lib/presets";

interface Props {
  number: number;
  /** Key in doc.triggers, e.g. "click" or "interval:6". */
  triggerKey: string;
  /** Move it plays. */
  seq: string;
}

/** One trigger: when it fires, its detail (seconds, event name), and which move plays. */
export const TriggerRow = ({ number: n, triggerKey: key, seq }: Props) => {
  const dispatch = useMascotDispatch();
  const triggers = useMascotSelector(s => s.doc.triggers);
  const sequences = useMascotSelector(s => s.doc.sequences);
  const { kind, param } = parseTrigger(key);
  const moves = Object.keys(sequences);

  /** False when another row already owns `to`; trigger keys are unique. */
  const replace = (to: string, nextSeq = seq): boolean => {
    if (to !== key && to in triggers) return false;
    dispatch({ type: "replace-trigger", from: key, to, seq: nextSeq });
    return true;
  };

  return (
    <GridTableRow>
      <span className="font-mono text-xs text-muted">{n}</span>
      <Select<TriggerKind>
        items={TRIGGER_KINDS.map(k => ({ value: k.id, label: k.label }))}
        value={kind}
        onValueChange={next => next && replace(uniqueTrigger(next, triggers))}
      >
        <SelectTrigger
          aria-label={`When, trigger ${n}`}
          size="sm"
          className="w-full min-w-0 font-mono"
        >
          {/* A key the studio can't parse shows as-is until the user picks a kind. */}
          <SelectValue placeholder={key} />
        </SelectTrigger>
        <SelectContent>
          {TRIGGER_KINDS.map(k => {
            // Only one row can own "click", "hover" or "load".
            const taken = k.id !== kind && k.id in triggers;
            return (
              <SelectItem key={k.id} value={k.id} disabled={taken} className="font-mono">
                {k.label}
                {taken ? " (used)" : ""}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <TriggerDetailField
        number={n}
        triggerKey={key}
        kind={kind}
        param={param}
        onCommit={replace}
      />
      <Select<string>
        value={seq in sequences ? seq : null}
        onValueChange={next => next && replace(key, next)}
      >
        <SelectTrigger
          aria-label={`Play, trigger ${n}`}
          size="sm"
          className="w-full min-w-0 font-mono"
        >
          <SelectValue placeholder={`${seq} (missing)`} />
        </SelectTrigger>
        <SelectContent>
          {moves.map(m => (
            <SelectItem key={m} value={m} className="font-mono">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <IconButton
        size="md"
        variant="ghost"
        label={`Remove trigger ${n}`}
        onClick={() => dispatch({ type: "remove-trigger", key })}
      >
        <XIcon size={12} />
      </IconButton>
    </GridTableRow>
  );
};

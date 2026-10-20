"use client";

import type { TriggerKind } from "@/lib/presets";

import { GridTableRow } from "@/components/ui/grid-table";
import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon } from "@/components/ui/icons";
import { Select } from "@/components/ui/input";
import { TriggerDetailField } from "@/features/animate/components/trigger-detail-field";
import { useMascot } from "@/lib/mascot-store";
import { TRIGGER_KINDS, buildTrigger, parseTrigger } from "@/lib/presets";

interface Props {
  number: number;
  /** Key in doc.triggers, e.g. "click" or "interval:8". */
  triggerKey: string;
  /** Move it plays. */
  seq: string;
}

/** One trigger: when it fires, its detail (seconds, event name), and which move plays. */
export const TriggerRow = ({ number: n, triggerKey: key, seq }: Props) => {
  const { state, dispatch } = useMascot();
  const { doc } = state;
  const { kind, param } = parseTrigger(key);
  const moves = Object.keys(doc.sequences);

  const replace = (to: string, nextSeq = seq) =>
    dispatch({ type: "replace-trigger", from: key, to, seq: nextSeq });

  return (
    <GridTableRow>
      <span className="font-mono text-xs text-muted">{n}</span>
      <Select
        aria-label={`When, trigger ${n}`}
        value={kind ?? ""}
        onChange={e => replace(buildTrigger(e.target.value as TriggerKind, ""))}
        className="min-w-0 px-1.5 font-mono"
      >
        {kind === null && <option value="">{key}</option>}
        {TRIGGER_KINDS.map(k => {
          // Only one row can own "click", "hover" or "load".
          const taken = k.id !== kind && k.id in doc.triggers;
          return (
            <option key={k.id} value={k.id} disabled={taken}>
              {k.label}
              {taken ? " (used)" : ""}
            </option>
          );
        })}
      </Select>
      <TriggerDetailField
        number={n}
        triggerKey={key}
        kind={kind}
        param={param}
        onCommit={replace}
      />
      <Select
        aria-label={`Play, trigger ${n}`}
        value={seq in doc.sequences ? seq : ""}
        onChange={e => replace(key, e.target.value)}
        className="min-w-0 px-1.5 font-mono"
      >
        {!(seq in doc.sequences) && <option value="">{seq} (missing)</option>}
        {moves.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <IconButton
        size="md"
        variant="ghost"
        label={`Remove trigger ${n}`}
        onClick={() => dispatch({ type: "remove-trigger", key })}
      >
        <CloseIcon width={12} height={12} />
      </IconButton>
    </GridTableRow>
  );
};

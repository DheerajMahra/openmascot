"use client";

import type { TriggerKind } from "@/lib/presets";

import { CloseIcon } from "@/components/icons";
import { Btn, IconBtn, Label, inputClass } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";
import { TRIGGER_KINDS, buildTrigger, parseTrigger } from "@/lib/presets";

const COLS =
  "grid grid-cols-[18px_minmax(150px,1fr)_140px_minmax(150px,1fr)_28px] items-center gap-2.5";

/**
 * Every trigger of the mascot: when something happens on the page, which move plays.
 * Each "when" is a key of doc.triggers, so no two rows share one.
 */
export const TriggersTable = () => {
  const { state, dispatch } = useMascot();
  const { doc, seqName } = state;
  const moves = Object.keys(doc.sequences);
  const rows = Object.entries(doc.triggers).filter(([key]) => key !== "idle");

  const replace = (from: string, to: string, seq: string) =>
    dispatch({ type: "replace-trigger", from, to, seq });

  return (
    <div className="flex flex-col gap-2.5 border-t border-line pt-4">
      <Label>Triggers</Label>
      <div aria-label="Triggers" className="flex flex-col">
        <div
          className={`${COLS} border-b border-line px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.04em] text-muted`}
        >
          <span>#</span>
          <span>When</span>
          <span>Detail</span>
          <span>Play</span>
          <span aria-label="Remove" />
        </div>

        {rows.map(([key, seq], i) => {
          const { kind, param } = parseTrigger(key);
          const n = i + 1;
          return (
            <div key={key} className={`${COLS} border-b border-line-2 p-2`}>
              <span className="font-mono text-xs text-muted">{n}</span>
              <select
                aria-label={`When, trigger ${n}`}
                value={kind ?? ""}
                onChange={e => replace(key, buildTrigger(e.target.value as TriggerKind, ""), seq)}
                className={`${inputClass} min-w-0 px-1.5 font-mono`}
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
              </select>
              {kind === "interval" ? (
                <label className="flex items-center gap-1.5 font-mono text-xs text-muted">
                  <span className="sr-only">Seconds, trigger {n}</span>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    key={key}
                    defaultValue={param || "8"}
                    onBlur={e => {
                      const secs = Math.max(1, parseInt(e.target.value, 10) || 8);
                      replace(key, buildTrigger("interval", String(secs)), seq);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className={`${inputClass} w-full px-2 py-1.5 font-mono`}
                  />
                  s
                </label>
              ) : kind === "custom" ? (
                <input
                  type="text"
                  aria-label={`Event name, trigger ${n}`}
                  key={key}
                  defaultValue={param}
                  onBlur={e => {
                    const name = e.target.value.trim().replace(/\s+/g, "-");
                    if (name && name !== param) replace(key, buildTrigger("custom", name), seq);
                    else e.target.value = param;
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  className={`${inputClass} w-full px-2 py-1.5 font-mono`}
                />
              ) : (
                <span className="pl-2 font-mono text-[13px] text-stage-text">—</span>
              )}
              <select
                aria-label={`Play, trigger ${n}`}
                value={seq in doc.sequences ? seq : ""}
                onChange={e => replace(key, key, e.target.value)}
                className={`${inputClass} min-w-0 px-1.5 font-mono`}
              >
                {!(seq in doc.sequences) && <option value="">{seq} (missing)</option>}
                {moves.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <IconBtn
                size="sm"
                label={`Remove trigger ${n}`}
                onClick={() => dispatch({ type: "remove-trigger", key })}
                className="h-7 w-7 border-transparent bg-transparent text-muted hover:border-line"
              >
                <CloseIcon width={12} height={12} />
              </IconBtn>
            </div>
          );
        })}

        {rows.length === 0 && (
          <p className="m-0 px-2 py-3 text-[13px] text-muted">
            No triggers yet. Moves without one only play from the preview.
          </p>
        )}

        <Btn
          variant="dashed"
          className="mt-2.5 self-start font-mono"
          onClick={() => dispatch({ type: "add-trigger", seq: seqName })}
        >
          + Add trigger
        </Btn>
      </div>
      <p className="m-0 text-xs leading-relaxed text-muted">
        &quot;My site sends&quot; fires from page code:{" "}
        <span className="font-mono text-ink">Mascot.emit(&quot;name&quot;)</span>.
      </p>
    </div>
  );
};

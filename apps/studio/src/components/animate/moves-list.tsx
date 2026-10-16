"use client";

import { InfoTip, Label, NameField, inputClass } from "@/components/ui";
import { triggersFor, useMascot } from "@/lib/mascot-store";
import { MOVE_PRESETS, describeTriggers } from "@/lib/presets";

const MOVES_HELP =
  "A move is a few poses shown one after another, like a flipbook. idle plays whenever nothing else is. Pick a move to edit its poses; the Triggers table says when each one plays.";

const DUPLICATE = "duplicate";

/** Left column of Animate: every move with when it plays, and a way to start a new one. */
export const MovesList = () => {
  const { state, dispatch } = useMascot();
  const { doc, seqName } = state;
  const poses = Object.keys(doc.poses);

  const addMove = (id: string) => {
    if (id === DUPLICATE) {
      dispatch({ type: "add-seq", name: `${seqName}-copy`, from: seqName });
      return;
    }
    const preset = MOVE_PRESETS.find(p => p.id === id);
    if (!preset) return;
    const name = id === "empty" ? "new-move" : id;
    dispatch({ type: "add-seq", name, frames: preset.build(poses) });
  };

  return (
    <section
      aria-label="Moves"
      className="flex min-w-0 flex-[0_1_210px] flex-col gap-2 border-r border-line bg-paper-2 px-3.5 py-5"
    >
      <NameField value={doc.name} onChange={name => dispatch({ type: "set-name", name })} />
      <span aria-hidden="true" className="my-1.5 h-px bg-line" />

      <Label>
        Moves
        <InfoTip label="About moves" text={MOVES_HELP} />
      </Label>
      {Object.keys(doc.sequences).map(name => {
        const active = name === seqName;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => dispatch({ type: "select-seq", name })}
            className={[
              "flex cursor-pointer items-center justify-between gap-2 rounded-lg border text-left text-ink transition-colors",
              active
                ? "border-2 border-clay bg-clay-tint px-[11px] py-[9px]"
                : "border-line bg-paper px-3 py-2.5 hover:border-clay"
            ].join(" ")}
          >
            <span className="truncate font-mono text-[13px]">{name}</span>
            <span className="shrink-0 truncate text-[11px] text-muted">
              {describeTriggers(doc, name, triggersFor(doc, name))}
            </span>
          </button>
        );
      })}
      <select
        aria-label="New move"
        value=""
        onChange={e => addMove(e.target.value)}
        className={`${inputClass} mt-1 cursor-pointer border-dashed border-stage-text text-muted`}
      >
        <option value="" disabled>
          + New move…
        </option>
        {MOVE_PRESETS.filter(p => p.id !== "empty").map(p => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
        <option value={DUPLICATE}>Duplicate {seqName}</option>
        <option value="empty">Start empty</option>
      </select>
      <p className="mt-1.5 mb-0 text-xs leading-relaxed text-muted">
        {doc.triggers.idle ?? "idle"} loops whenever nothing else is playing.
      </p>
    </section>
  );
};

"use client";

import type { MouseEvent } from "react";

import { MascotThumb } from "@/components/mascot-thumb";
import { Btn, InfoTip, Label, NameField } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";

const POSES_HELP =
  "A pose is one drawing of your mascot. Moves switch between poses. A new pose starts as a copy of default, so change only what differs: eyes, arms, mouth.";

/** Left column of Make: the palette, then the pose list. */
export const MakeSidebar = () => {
  const { state, dispatch } = useMascot();
  const { doc, colorIndex, poseName } = state;

  /** First click selects the color to paint with; a click on the selected one opens the picker. */
  const onSwatchClick = (e: MouseEvent<HTMLInputElement>, index: number) => {
    if (index !== colorIndex) {
      e.preventDefault();
      dispatch({ type: "set-color", index });
    }
  };

  const addPose = () => {
    const name = window.prompt("Name the new pose:", "")?.trim();
    if (name) dispatch({ type: "add-pose", name, from: "default" });
  };

  return (
    <aside
      aria-label="Colors and poses"
      className="flex min-w-0 flex-[0_1_200px] flex-col gap-2.5 border-r border-line bg-paper-2 px-3.5 py-5"
    >
      <NameField value={doc.name} onChange={name => dispatch({ type: "set-name", name })} />
      <span aria-hidden="true" className="my-1.5 h-px bg-line" />

      <Label>Colors</Label>
      <div className="grid grid-cols-4 gap-1.5">
        {doc.palette.map((hex, i) => (
          <input
            key={i}
            type="color"
            value={hex}
            aria-label={`Color ${i + 1}${i === colorIndex ? ", selected" : ""}`}
            title={i === colorIndex ? "Click again to change this color" : "Paint with this color"}
            onClick={e => onSwatchClick(e, i)}
            onChange={e => dispatch({ type: "set-palette", index: i, hex: e.target.value })}
            className={[
              "h-9 w-full cursor-pointer rounded-md p-0",
              i === colorIndex
                ? "border-2 border-ink shadow-[0_0_0_2px_var(--color-paper),0_0_0_3px_var(--color-ink)]"
                : "border border-line"
            ].join(" ")}
            style={{ background: hex }}
          />
        ))}
        {doc.palette.length < 36 && (
          <label
            title="Add a color"
            className="relative flex h-9 cursor-pointer items-center justify-center rounded-md border border-dashed border-stage-text bg-paper text-lg text-muted hover:border-clay"
          >
            +
            <input
              type="color"
              aria-label="Add a color"
              defaultValue="#ffffff"
              onChange={e => dispatch({ type: "add-color", hex: e.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        )}
      </div>

      <span aria-hidden="true" className="my-1.5 h-px bg-line" />

      <Label className="h-6">
        Poses
        <InfoTip label="About poses" text={POSES_HELP} />
      </Label>
      <div className="flex max-h-[380px] flex-col gap-1.5 overflow-y-auto pr-0.5">
        {Object.keys(doc.poses).map(name => {
          const active = name === poseName;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => dispatch({ type: "select-pose", name })}
              className={[
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left font-mono text-[13px] text-ink transition-colors",
                active
                  ? "border-2 border-clay bg-clay-tint"
                  : "border-line bg-paper hover:border-clay"
              ].join(" ")}
            >
              <span className="flex h-8 w-12 shrink-0 items-end justify-center rounded bg-stage">
                <MascotThumb doc={doc} pose={name} width={36} />
              </span>
              <span className="truncate">{name}</span>
            </button>
          );
        })}
      </div>
      <Btn variant="dashed" className="text-left font-mono" onClick={addPose}>
        + New pose
      </Btn>
    </aside>
  );
};

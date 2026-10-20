"use client";

import type { MouseEvent } from "react";

import { SectionLabel } from "@/components/ui/section-label";
import { useEditorTool, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { cn } from "@/lib/utils";

const MAX_COLORS = 36;

/** The paint colors. First click picks the color to paint with; a click on the picked one edits it. */
export const PalettePicker = () => {
  const dispatch = useMascotDispatch();
  const palette = useMascotSelector(s => s.doc.palette);
  const { colorIndex } = useEditorTool();

  const onSwatchClick = (e: MouseEvent<HTMLInputElement>, index: number) => {
    if (index !== colorIndex) {
      e.preventDefault();
      dispatch({ type: "set-color", index });
    }
  };

  return (
    <>
      <SectionLabel>Colors</SectionLabel>
      <div className="grid grid-cols-4 gap-1.5">
        {palette.map((hex, i) => {
          const selected = i === colorIndex;
          return (
            <input
              key={i}
              type="color"
              value={hex}
              aria-label={`Color ${i + 1}${selected ? ", selected" : ""}`}
              title={selected ? "Click again to change this color" : "Paint with this color"}
              onClick={e => onSwatchClick(e, i)}
              onChange={e => dispatch({ type: "set-palette", index: i, hex: e.target.value })}
              className={cn(
                "h-9 w-full cursor-pointer rounded-md p-0",
                selected
                  ? "border-2 border-ink shadow-[0_0_0_2px_var(--color-paper),0_0_0_3px_var(--color-ink)]"
                  : "border border-line"
              )}
              style={{ background: hex }}
            />
          );
        })}
        {palette.length < MAX_COLORS && (
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
    </>
  );
};

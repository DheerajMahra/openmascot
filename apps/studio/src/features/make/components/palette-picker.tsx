"use client";

import type { MouseEvent } from "react";

import { PlusIcon } from "lucide-react";
import { useRef } from "react";

import { SectionLabel } from "@/components/ui/section-label";
import {
  MAX_COLORS,
  useEditorTool,
  useMascotDispatch,
  useMascotSelector
} from "@/lib/mascot-store";
import { cn } from "@/lib/utils";

const ADD_START = "#ffffff";

/** The paint colors. First click picks the color to paint with; a click on the picked one edits it. */
export const PalettePicker = () => {
  const dispatch = useMascotDispatch();
  const palette = useMascotSelector(s => s.doc.palette);
  const { colorIndex } = useEditorTool();
  // A color picker reports every drag tick. The first tick of a pick adds a swatch, or changes one and
  // makes one undo step; the rest update that swatch. The native change event ends the pick.
  const picking = useRef<number | null>(null);

  const onPick = (hex: string, index?: number) => {
    if (picking.current !== null) {
      dispatch({ type: "set-palette", index: picking.current, hex, commit: false });
    } else if (index === undefined) {
      picking.current = palette.length;
      dispatch({ type: "add-color", hex });
    } else {
      picking.current = index;
      dispatch({ type: "set-palette", index, hex, commit: true });
    }
  };

  // React's onChange is the native input event, so listen for the native change event directly.
  // `resetTo` puts the add input back to its starting color once a pick is done.
  const endPickOnChange = (resetTo?: string) => (el: HTMLInputElement | null) => {
    if (!el) return;
    const onDone = () => {
      picking.current = null;
      if (resetTo) el.value = resetTo;
    };
    el.addEventListener("change", onDone);
    return () => el.removeEventListener("change", onDone);
  };

  const onSwatchClick = (e: MouseEvent<HTMLInputElement>, index: number) => {
    if (index !== colorIndex) {
      e.preventDefault();
      dispatch({ type: "set-color", index });
    }
  };

  return (
    <>
      <SectionLabel>Colors</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {palette.map((hex, i) => {
          const selected = i === colorIndex;
          return (
            <input
              key={i}
              type="color"
              value={hex}
              aria-label={`Color ${i + 1}${selected ? ", selected" : ""}`}
              title={selected ? "Click again to change this color" : "Paint with this color"}
              ref={endPickOnChange()}
              onClick={e => onSwatchClick(e, i)}
              onChange={e => onPick(e.target.value, i)}
              className={cn(
                "size-9 shrink-0 cursor-pointer rounded-md p-0",
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
            className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed border-stage-text bg-paper text-lg text-muted hover:border-clay"
          >
            <PlusIcon size={16} />
            <input
              type="color"
              aria-label="Add a color"
              ref={endPickOnChange(ADD_START)}
              defaultValue={ADD_START}
              onChange={e => onPick(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        )}
      </div>
    </>
  );
};

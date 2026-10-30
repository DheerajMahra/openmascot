"use client";

import type { MascotDoc } from "openmascot";
import type { MascotElement } from "openmascot/react";
import type { CSSProperties, MouseEvent, Ref } from "react";

import { sequencePadding } from "openmascot";
import { Mascot as OpenMascot } from "openmascot/react";
import { useRef } from "react";

import { Hearts } from "@/components/mascot/hearts/Hearts";
import { useHearts } from "@/components/mascot/hearts/use-hearts";
import { cn } from "@/lib/utils";

interface MascotProps {
  doc: MascotDoc;
  /** Screen pixels per cell. */
  scale: number;
  /** Accessible name. Defaults to "<name> mascot", or "<name>. Click to pet." when pettable. */
  label?: string;
  /**
   * Render as a button: hover plays the hover move, a click or Enter plays the click move and
   * sends up a few hearts. Otherwise the mascot is a labelled image.
   */
  pettable?: boolean;
  /** For a pettable mascot: -1 keeps a repeated copy out of the tab order. */
  tabIndex?: number;
  /** Wire the doc's triggers. Turn off when a scene drives the mascot itself. Default true. */
  triggers?: boolean;
  /** A handle for `play(move, { to: name })` and `emit(event, { to: name })`. */
  name?: string;
  /** The <open-mascot> element, for `play()` and `emit()` on this one mascot. */
  ref?: Ref<MascotElement>;
  className?: string;
}

/** Canvas size in px for a doc at a scale: the grid plus the slack its moves need. */
export const mascotSize = (doc: MascotDoc, scale: number) => {
  const pad = sequencePadding(doc);
  return {
    width: (doc.grid.w + pad.left + pad.right) * scale,
    height: (doc.grid.h + pad.up + pad.down) * scale
  };
};

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
};

/**
 * A mascot drawn by the published `openmascot/react` component. The box is sized before the
 * canvas exists, so nothing shifts when it mounts.
 */
export const Mascot = ({
  doc,
  scale,
  label,
  pettable,
  tabIndex,
  triggers = true,
  name,
  ref,
  className
}: MascotProps) => {
  const mascot = useRef<MascotElement | null>(null);
  const [hearts, burst] = useHearts();
  const accessibleName = label ?? (pettable ? `${doc.name}. Click to pet.` : `${doc.name} mascot`);

  const { width, height } = mascotSize(doc, scale);
  const size = { "--mascot-w": `${width}px`, "--mascot-h": `${height}px` } as CSSProperties;
  const box = "block h-(--mascot-h) w-(--mascot-w) leading-0";

  const element = (
    <OpenMascot
      doc={doc}
      scale={scale}
      triggers={triggers}
      name={name}
      style={size}
      className={cn(box, !pettable && className)}
      ref={el => {
        mascot.current = el;
        // The canvas inherits the label from its button, or carries it when it stands alone.
        const canvas = el?.player?.canvas;
        if (pettable) canvas?.setAttribute("aria-hidden", "true");
        else canvas?.setAttribute("aria-label", accessibleName);
        assignRef(ref, el);
        return () => {
          mascot.current = null;
          assignRef(ref, null);
        };
      }}
    />
  );

  if (!pettable) return element;

  const pet = (e: MouseEvent<HTMLButtonElement>) => {
    // A mouse click reached the mascot's own click trigger on the way up. Enter or Space
    // clicks only the button, so play the click move here, and send hearts from the top middle.
    if (e.clientX || e.clientY) return burst(e.clientX, e.clientY);
    const move = doc.triggers?.click;
    if (move && triggers) mascot.current?.play(move);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top);
  };

  return (
    <>
      <button
        type="button"
        tabIndex={tabIndex}
        aria-label={accessibleName}
        onClick={pet}
        style={size}
        className={cn(box, "cursor-pointer rounded-lg border-0 bg-transparent p-0", className)}
      >
        {element}
      </button>
      <Hearts hearts={hearts} />
    </>
  );
};

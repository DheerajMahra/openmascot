"use client";

import type { MascotDoc } from "@openmascot/embed";
import type { CSSProperties, MouseEvent } from "react";

import { MascotPlayer, sequencePadding } from "@openmascot/embed";
import { useEffect, useEffectEvent, useRef } from "react";

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
  /** Wire the doc's triggers. Turn off when a scene drives the player itself. Default true. */
  triggers?: boolean;
  /** The live player once mounted, and null again on unmount. */
  onPlayer?: (player: MascotPlayer | null) => void;
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

/**
 * A mascot drawn by the real embed runtime. The host box is sized before the canvas exists,
 * so nothing shifts when it mounts.
 */
export const Mascot = ({
  doc,
  scale,
  label,
  pettable,
  tabIndex,
  triggers = true,
  onPlayer,
  className
}: MascotProps) => {
  const hostRef = useRef<HTMLElement>(null);
  const playerRef = useRef<MascotPlayer | null>(null);
  const [hearts, burst] = useHearts();
  const name = label ?? (pettable ? `${doc.name}. Click to pet.` : `${doc.name} mascot`);
  const report = useEffectEvent((player: MascotPlayer | null) => onPlayer?.(player));
  // The canvas inherits the label from its button, or carries it when it stands alone.
  const labelCanvas = useEffectEvent((canvas: HTMLCanvasElement) => {
    if (pettable) canvas.setAttribute("aria-hidden", "true");
    else canvas.setAttribute("aria-label", name);
  });
  const initialScale = useEffectEvent(() => scale);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const player = new MascotPlayer(host, doc, { scale: initialScale(), triggers });
    playerRef.current = player;
    labelCanvas(player.canvas);
    report(player);
    return () => {
      player.destroy();
      playerRef.current = null;
      report(null);
    };
  }, [doc, triggers]);

  useEffect(() => playerRef.current?.setScale(scale), [scale]);

  const { width, height } = mascotSize(doc, scale);
  const size = { "--mascot-w": `${width}px`, "--mascot-h": `${height}px` } as CSSProperties;
  const box = "block h-(--mascot-h) w-(--mascot-w) leading-0";

  if (!pettable) {
    return (
      <span ref={hostRef} style={size} className={cn(box, className)} data-mascot={doc.name} />
    );
  }

  const pet = (e: MouseEvent<HTMLButtonElement>) => {
    // A keyboard click has no pointer position; send the hearts up from the top middle.
    if (e.clientX || e.clientY) return burst(e.clientX, e.clientY);
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top);
  };

  return (
    <>
      <button
        ref={el => {
          hostRef.current = el;
        }}
        type="button"
        tabIndex={tabIndex}
        aria-label={name}
        onClick={pet}
        style={size}
        className={cn(box, "cursor-pointer rounded-lg border-0 bg-transparent p-0", className)}
        data-mascot={doc.name}
      />
      <Hearts hearts={hearts} />
    </>
  );
};

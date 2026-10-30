"use client";

import type { MascotPlayer } from "openmascot";
import type { RefObject } from "react";

import { useRef } from "react";

import { previewChips } from "@/components/editor/preview-chips";
import { MascotPreview } from "@/components/mascot/mascot-preview";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { Pill } from "@/components/ui/pill";
import { SectionLabel } from "@/components/ui/section-label";
import { useMascotDoc } from "@/lib/mascot-store";

export interface LivePreviewProps {
  /** Try: nothing plays on its own. Live: triggers wired, as on a site. */
  mode: "try" | "live";
  /** Receives the live player, for steps that also drive it (Animate scrubs steps). */
  playerRef?: RefObject<MascotPlayer | null>;
  /** Move to show as active; Animate passes the selected one. */
  activeMove?: string;
  /** Called after a chip starts a move. */
  onPlay?: () => void;
}

const HINTS = {
  try: "Tap a chip to play a move.",
  live: "Your finished mascot, running exactly as it will on your site. Hover it, click it, or wait a moment to watch its triggers play."
} as const;

/** The mascot on its stage, with a chip per move and per trigger. Placed by the step. */
export const LivePreview = ({
  mode,
  playerRef: outerRef,
  activeMove,
  onPlay
}: LivePreviewProps) => {
  const doc = useMascotDoc();
  const innerRef = useRef<MascotPlayer | null>(null);
  const playerRef = outerRef ?? innerRef;
  const { moves, triggers } = previewChips(doc);

  // Custom triggers play their move too: emit() does nothing while triggers are off.
  const play = (move: string) => {
    playerRef.current?.play(move);
    onPlay?.();
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col">
        <SectionLabel>{mode === "live" ? "Live preview" : "Preview"}</SectionLabel>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{HINTS[mode]}</p>
      </div>
      <MascotStage>
        {/* The player wires triggers once, at mount, so Live remounts it when they change:
            a page load first mounts the sample, then the stored mascot arrives. */}
        <MascotPreview
          key={mode === "live" ? JSON.stringify(doc.triggers) : undefined}
          doc={doc}
          scale={8}
          triggers={mode === "live"}
          playerRef={playerRef}
        />
      </MascotStage>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Moves</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          {moves.map(name => (
            <Pill key={name} active={name === activeMove} onClick={() => play(name)}>
              {name}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Triggers</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          {triggers.map(t => (
            <Pill key={t.key} aria-label={`Play ${t.seq} (${t.label})`} onClick={() => play(t.seq)}>
              {t.label} <span className="text-muted">→</span> {t.seq}
            </Pill>
          ))}
          {triggers.length === 0 && (
            <span className="text-[13px] text-muted">No triggers added.</span>
          )}
        </div>
      </div>
    </div>
  );
};

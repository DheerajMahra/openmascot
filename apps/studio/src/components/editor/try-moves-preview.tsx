"use client";

import type { MascotPlayer } from "@openmascot/embed";

import { useRef } from "react";

import { EditorPreviewPanel } from "@/components/layout/editor-shell";
import { MascotPreview } from "@/components/mascot/mascot-preview";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { Pill } from "@/components/ui/pill";
import { SectionLabel } from "@/components/ui/section-label";
import { useMascotDoc } from "@/lib/mascot-store";

interface Props {
  /** One line under "Try a move" saying what the preview is showing on this step. */
  hint: string;
  /** Shown in place of the move buttons when the mascot has no moves. */
  emptyHint: string;
}

/** Right column of Make and Share: the live mascot, a button per move to try it, and Next. */
export const TryMovesPreview = ({ hint, emptyHint }: Props) => {
  const doc = useMascotDoc();
  const playerRef = useRef<MascotPlayer | null>(null);
  const moves = Object.keys(doc.sequences);

  return (
    <EditorPreviewPanel aria-label="Live preview">
      <SectionLabel>Preview</SectionLabel>
      <MascotStage>
        <MascotPreview doc={doc} scale={8} playerRef={playerRef} />
      </MascotStage>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Try a move</span>
        <p className="m-0 text-[13px] leading-relaxed text-muted">{hint}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {moves.map(name => (
          <Pill key={name} onClick={() => playerRef.current?.play(name)}>
            {name}
          </Pill>
        ))}
        {moves.length === 0 && <span className="text-[13px] text-muted">{emptyHint}</span>}
      </div>
    </EditorPreviewPanel>
  );
};

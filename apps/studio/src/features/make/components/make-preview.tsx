"use client";

import type { MascotPlayer } from "@openmascot/embed";

import { useRef } from "react";

import { NextStepLink } from "@/components/editor/next-step-link";
import { EditorPreviewPanel } from "@/components/layout/editor-shell";
import { MascotPreview } from "@/components/mascot/mascot-preview";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { Pill } from "@/components/ui/pill";
import { SectionLabel } from "@/components/ui/section-label";
import { useMascot } from "@/lib/mascot-store";

/** Right column of Make: the live mascot, a way to try moves, and Next. */
export const MakePreview = () => {
  const { state } = useMascot();
  const { doc } = state;
  const playerRef = useRef<MascotPlayer | null>(null);
  const idle = doc.triggers.idle ?? "idle";
  const moves = Object.keys(doc.sequences).filter(name => name !== idle);

  return (
    <EditorPreviewPanel aria-label="Live preview">
      <SectionLabel>Preview</SectionLabel>
      <MascotStage className="h-[280px]">
        <MascotPreview scale={8} playerRef={playerRef} />
      </MascotStage>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Try a move</span>
        <p className="m-0 text-[13px] leading-relaxed text-muted">
          This is exactly what your site will show. It plays the idle move while you draw.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {moves.map(name => (
          <Pill key={name} onClick={() => playerRef.current?.play(name)}>
            {name}
          </Pill>
        ))}
        {moves.length === 0 && (
          <span className="text-[13px] text-muted">No moves yet. Add some on the next step.</span>
        )}
      </div>
      <NextStepLink />
    </EditorPreviewPanel>
  );
};

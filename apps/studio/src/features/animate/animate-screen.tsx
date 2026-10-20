"use client";

import type { MascotPlayer } from "@openmascot/embed";

import { useRef, useState } from "react";

import { EditorColumns, EditorWorkspace } from "@/components/layout/editor-shell";
import { MoveHeader } from "@/features/animate/components/move-header";
import { MovePreview } from "@/features/animate/components/move-preview";
import { MovesList } from "@/features/animate/components/moves-list";
import { StepTable } from "@/features/animate/components/step-table";
import { TriggersTable } from "@/features/animate/components/triggers-table";
import { useLiveStep } from "@/features/animate/hooks/use-live-step";
import { startTick } from "@/features/animate/lib/timeline";
import { useEditorSelection, useMascotSelector } from "@/lib/mascot-store";

/** Step 2: string poses into moves and say when each one plays. */
export const AnimateScreen = () => {
  const { seqName } = useEditorSelection();
  const frames = useMascotSelector(s => s.doc.sequences[seqName]) ?? [];
  const playerRef = useRef<MascotPlayer | null>(null);

  // The row the user clicked, remembered per move so switching moves clears it.
  const [picked, setPicked] = useState<{ seq: string; index: number } | null>(null);
  const selected = picked && picked.seq === seqName ? picked.index : null;
  const live = useLiveStep(playerRef, seqName, frames);

  const selectStep = (index: number) => {
    setPicked({ seq: seqName, index });
    playerRef.current?.showFrame(seqName, startTick(frames, index));
  };

  const play = () => {
    setPicked(null);
    playerRef.current?.play(seqName);
  };

  return (
    <EditorColumns
      sidebar={<MovesList />}
      workspace={
        <EditorWorkspace aria-label={`The ${seqName} move`}>
          <MoveHeader />
          <StepTable activeStep={live ?? selected} onSelectStep={selectStep} />
          <TriggersTable />
        </EditorWorkspace>
      }
      preview={<MovePreview playerRef={playerRef} onPlay={play} />}
    />
  );
};

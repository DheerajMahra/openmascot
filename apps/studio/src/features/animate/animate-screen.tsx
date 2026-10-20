"use client";

import type { MascotPlayer } from "@openmascot/embed";

import { useRef, useState } from "react";

import { EditorWorkspace } from "@/components/layout/editor-shell";
import { MoveHeader } from "@/features/animate/components/move-header";
import { MovePreview } from "@/features/animate/components/move-preview";
import { MovesList } from "@/features/animate/components/moves-list";
import { StepTable } from "@/features/animate/components/step-table";
import { TriggersTable } from "@/features/animate/components/triggers-table";
import { useLiveStep } from "@/features/animate/hooks/use-live-step";
import { startTick } from "@/features/animate/lib/timeline";
import { useMascot } from "@/lib/mascot-store";

/** Step 2: string poses into moves and say when each one plays. */
export const AnimateScreen = () => {
  const { state } = useMascot();
  const { doc, seqName } = state;
  const frames = doc.sequences[seqName] ?? [];
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
    <>
      <MovesList />
      <EditorWorkspace aria-label={`The ${seqName} move`}>
        <MoveHeader />
        <StepTable activeStep={live ?? selected} onSelectStep={selectStep} />
        <TriggersTable />
      </EditorWorkspace>
      <MovePreview playerRef={playerRef} onPlay={play} />
    </>
  );
};

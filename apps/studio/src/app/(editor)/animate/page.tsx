"use client";

import type { MascotFrame, MascotPlayer } from "@openmascot/embed";
import type { RefObject } from "react";

import { useEffect, useRef, useState } from "react";

import { MovePreview } from "@/components/animate/move-preview";
import { MovesList } from "@/components/animate/moves-list";
import { StepTable } from "@/components/animate/step-table";
import { TriggersTable } from "@/components/animate/triggers-table";
import { useMascot } from "@/lib/mascot-store";

/** Expanded frame index (one per tick) where step `index` starts. */
const startTick = (frames: MascotFrame[], index: number): number =>
  frames.slice(0, index).reduce((sum, f) => sum + Math.max(1, Math.floor(f.hold) || 1), 0);

/** Which step owns expanded frame `tick`. */
const stepAtTick = (frames: MascotFrame[], tick: number): number | null => {
  let sum = 0;
  for (let i = 0; i < frames.length; i++) {
    sum += Math.max(1, Math.floor(frames[i]?.hold ?? 1) || 1);
    if (tick < sum) return i;
  }
  return null;
};

/** The step on screen while the preview plays this move, else null. Polled, since the runtime has no events. */
const useLiveStep = (
  playerRef: RefObject<MascotPlayer | null>,
  seqName: string,
  frames: MascotFrame[]
): number | null => {
  const [live, setLive] = useState<number | null>(null);
  useEffect(() => {
    const id = setInterval(() => {
      const player = playerRef.current;
      const next =
        player && player.current === seqName && player.isPlaying()
          ? stepAtTick(frames, player.currentIndex())
          : null;
      setLive(prev => (prev === next ? prev : next));
    }, 30);
    return () => clearInterval(id);
  }, [playerRef, seqName, frames]);
  return live;
};

export default function AnimatePage() {
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
      <section
        aria-label={`The ${seqName} move`}
        className="flex min-w-0 flex-[999_1_560px] flex-col gap-4.5 border-r border-line px-6 py-5"
      >
        <StepTable activeStep={live ?? selected} onSelectStep={selectStep} />
        <TriggersTable />
      </section>
      <MovePreview playerRef={playerRef} onPlay={play} />
    </>
  );
}

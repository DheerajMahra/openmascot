import type { MascotFrame, MascotPlayer } from "openmascot";
import type { RefObject } from "react";

import { useEffect, useState } from "react";

import { stepAtTick } from "@/features/animate/lib/timeline";

/** The step on screen while the preview plays this move, else null. Polled, since the runtime has no events. */
export const useLiveStep = (
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

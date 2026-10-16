"use client";

import type { MascotPlayer } from "@openmascot/embed";
import type { RefObject } from "react";

import Link from "next/link";
import { useEffect } from "react";

import { PlayIcon } from "@/components/icons";
import { nextButtonClass } from "@/components/make/make-preview";
import { MascotPreview } from "@/components/mascot-preview";
import { Label, Stage } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";

interface Props {
  playerRef: RefObject<MascotPlayer | null>;
  onPlay: () => void;
}

/** Right column of Animate: the mascot, one Play button, Next. */
export const MovePreview = ({ playerRef, onPlay }: Props) => {
  const { state } = useMascot();
  const { seqName } = state;

  // Play the selected move once the runtime is mounted; edits are picked up by setDoc.
  useEffect(() => {
    playerRef.current?.play(seqName);
  }, [seqName, playerRef]);

  return (
    <aside
      aria-label="Live preview"
      className="flex min-w-0 flex-[1_1_290px] flex-col gap-3 bg-paper-2 px-6 py-5"
    >
      <Label>Preview</Label>
      <Stage className="h-[260px] px-6 pt-0 pb-7">
        <MascotPreview scale={8} triggers={false} playerRef={playerRef} />
      </Stage>
      <button
        type="button"
        onClick={onPlay}
        className="flex cursor-pointer items-center gap-2 self-start rounded-full border border-ink bg-ink px-4 py-2.5 text-sm text-white hover:border-clay-deep hover:bg-clay-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
      >
        <PlayIcon width={12} height={12} /> Play {seqName}
      </button>
      <Link href="/share" className={nextButtonClass}>
        Next: Share →
      </Link>
    </aside>
  );
};

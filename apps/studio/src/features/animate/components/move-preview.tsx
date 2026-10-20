"use client";

import type { MascotPlayer } from "@openmascot/embed";
import type { RefObject } from "react";

import { useEffect } from "react";

import { NextStepLink } from "@/components/editor/next-step-link";
import { EditorPreviewPanel } from "@/components/layout/editor-shell";
import { MascotPreview } from "@/components/mascot/mascot-preview";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/section-label";
import { useEditorSelection, useMascotDoc } from "@/lib/mascot-store";

interface Props {
  playerRef: RefObject<MascotPlayer | null>;
  onPlay: () => void;
}

/** Right column of Animate: the mascot, one Play button, Next. */
export const MovePreview = ({ playerRef, onPlay }: Props) => {
  const doc = useMascotDoc();
  const { seqName } = useEditorSelection();

  // Play the selected move once the runtime is mounted; edits are picked up by setDoc.
  useEffect(() => {
    playerRef.current?.play(seqName);
  }, [seqName, playerRef]);

  return (
    <EditorPreviewPanel aria-label="Live preview">
      <SectionLabel>Preview</SectionLabel>
      <MascotStage className="h-[260px] px-6 pt-0 pb-7">
        <MascotPreview doc={doc} scale={8} triggers={false} playerRef={playerRef} />
      </MascotStage>
      <Button
        variant="primary"
        size="lg"
        onClick={onPlay}
        className="flex items-center gap-2 self-start rounded-full font-normal"
      >
        <PlayIcon width={12} height={12} /> Play {seqName}
      </Button>
      <NextStepLink />
    </EditorPreviewPanel>
  );
};

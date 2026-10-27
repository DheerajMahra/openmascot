"use client";

import type { StartFrom } from "@/lib/samples";

import { useRouter } from "next/navigation";

import { MascotPreview } from "@/components/mascot/mascot-preview";
import { InfoTip } from "@/components/ui/info-tip";
import { SectionLabel } from "@/components/ui/section-label";
import { StartTile, StartTileBody, StartTileMedia } from "@/features/start/components/start-tile";
import { newId } from "@/lib/pose-utils";
import { SAMPLES } from "@/lib/samples";

/** A light grid like the drawing board, so the blank tile reads as "empty canvas". */
const BOARD_GRID = {
  backgroundColor: "var(--color-board)",
  backgroundImage:
    "linear-gradient(var(--color-board-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-board-grid) 1px, transparent 1px)",
  backgroundSize: "14px 14px"
};

/**
 * Blank canvas plus every sample. Picking one opens Make on a new draft; the id is made on click so
 * every pick is a separate mascot, and it is only saved once something changes.
 */
export const StartingPoints = () => {
  const router = useRouter();

  const start = (from: StartFrom) => router.push(`/make/${newId()}?from=${from}`);

  return (
    <section aria-labelledby="start-from" className="flex flex-col gap-3">
      <SectionLabel id="start-from">Start from</SectionLabel>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
        <StartTile dashed aria-label="Start from a blank canvas" onClick={() => start("blank")}>
          <StartTileMedia className="items-center p-0" style={BOARD_GRID}>
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full border-2 border-white bg-orange"
            />
          </StartTileMedia>
          <StartTileBody
            title="Blank canvas"
            description="24 × 16 grid, one random color, one move ready."
          />
        </StartTile>

        {SAMPLES.map(sample => (
          <div key={sample.doc.id} className="relative flex">
            <StartTile className="flex-1" onClick={() => start(sample.key)}>
              <StartTileMedia>
                <MascotPreview doc={sample.doc} scale={6} />
              </StartTileMedia>
              <StartTileBody title={sample.doc.name} description={sample.blurb} />
            </StartTile>
            {/* A sibling, not a child: the tile is a button and can't hold another one. It sits on
                the title row: 150px media + 12px padding + 2px to center on the 20px line. */}
            {sample.notice && (
              <span className="absolute top-[164px] right-3.5">
                <InfoTip label={`About ${sample.doc.name}`} text={sample.notice} />
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

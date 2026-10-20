"use client";

import { useRouter } from "next/navigation";

import { MascotPreview } from "@/components/mascot/mascot-preview";
import { SectionLabel } from "@/components/ui/section-label";
import { StartTile, StartTileBody, StartTileMedia } from "@/features/start/components/start-tile";
import { createBlankMascot, useMascot } from "@/lib/mascot-store";
import { SAMPLES, cloneSample } from "@/lib/samples";

/** A light grid like the drawing board, so the blank tile reads as "empty canvas". */
const BOARD_GRID = {
  backgroundColor: "var(--color-board)",
  backgroundImage:
    "linear-gradient(var(--color-board-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-board-grid) 1px, transparent 1px)",
  backgroundSize: "14px 14px"
};

/** Blank canvas plus every sample. Picking one replaces the current mascot and opens Make. */
export const StartingPoints = () => {
  const { dispatch } = useMascot();
  const router = useRouter();

  const start = (doc: ReturnType<typeof createBlankMascot>) => {
    dispatch({ type: "replace-doc", doc });
    router.push("/make");
  };

  return (
    <section aria-labelledby="start-from" className="flex flex-col gap-3">
      <SectionLabel id="start-from">Start from</SectionLabel>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
        <StartTile
          dashed
          aria-label="Start from a blank canvas"
          onClick={() => start(createBlankMascot())}
        >
          <StartTileMedia className="items-center p-0" style={BOARD_GRID}>
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full border-2 border-white bg-clay"
            />
          </StartTileMedia>
          <StartTileBody
            title="Blank canvas"
            description="24 × 16 grid, four colors, an idle move ready."
          />
        </StartTile>

        {SAMPLES.map(sample => (
          <StartTile key={sample.doc.id} onClick={() => start(cloneSample(sample))}>
            <StartTileMedia>
              <MascotPreview doc={sample.doc} scale={6} triggers={false} />
            </StartTileMedia>
            <StartTileBody title={sample.doc.name} description={sample.blurb} />
          </StartTile>
        ))}
      </div>
    </section>
  );
};

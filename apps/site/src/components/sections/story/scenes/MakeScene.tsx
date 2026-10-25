"use client";

import type { CursorSpot } from "./SceneCursor";
import type { SceneProps } from "./types";
import type { BoardCell } from "@/components/mascot/pixel-board/PixelBoard";

import { useState } from "react";

import { PixelBoard } from "@/components/mascot/pixel-board/PixelBoard";
import { paintOrder } from "@/components/mascot/pixel-board/use-board-draw";
import { MOSS } from "@/lib/mascots";

import { Scene } from "./Scene";
import { SceneCursor } from "./SceneCursor";

const { w, h } = MOSS.grid;
const CELLS = paintOrder(MOSS, "default").length;

/** The cursor rests on the corner of the cell it just painted. */
const spotFor = (cell: BoardCell | null): CursorSpot =>
  cell
    ? { x: `${((cell.x + 1) / w) * 100}%`, y: `${((cell.y + 1) / h) * 100}%` }
    : { x: "50%", y: "50%" };

/** Step 1: Moss paints itself onto the board, row by row. */
export const MakeScene = ({ active, replayKey, onDone, ref }: SceneProps) => {
  const [progress, setProgress] = useState({ drawn: CELLS, total: CELLS, spot: spotFor(null) });

  return (
    <Scene
      ref={ref}
      step={0}
      shown={active}
      title="Make · Moss"
      readout={`${progress.drawn} / ${progress.total} cells`}
    >
      <div className="relative w-4/5 -rotate-2 lg:w-18/25 lg:max-w-110">
        <div className="rounded-xl border border-hairline bg-paper p-2.5 shadow-lift">
          <PixelBoard
            key={replayKey}
            doc={MOSS}
            label="Moss, painted cell by cell on a 24 by 16 board"
            playing={active}
            onProgress={(drawn, total, cell) => setProgress({ drawn, total, spot: spotFor(cell) })}
            onDone={onDone}
          />
        </div>
        <span className="absolute inset-2.5">
          <SceneCursor spot={progress.spot} fast />
        </span>
      </div>
    </Scene>
  );
};

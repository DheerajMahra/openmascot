import { PixelBoard } from "@/components/mascot/pixel-board/PixelBoard";
import { MOSS } from "@/lib/mascots";

/** Moss on the studio's gridded board, as a tilted sticker. */
export const EditorBoardArt = () => (
  <div className="w-45 -rotate-3 rounded-lg border-2 border-ink bg-paper p-1.5 shadow-ink-md">
    <PixelBoard doc={MOSS} label="Moss on the 24 by 16 drawing board" className="rounded-xs" />
  </div>
);

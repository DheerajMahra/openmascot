"use client";

import { TryMovesPreview } from "@/components/editor/try-moves-preview";

/** Right column of Make: the live mascot, a way to try moves, and Next. */
export const MakePreview = () => (
  <TryMovesPreview
    hint="This is exactly what your site will show, triggers included. It rests on the default pose while you draw."
    emptyHint="No moves yet. Add some on the next step."
  />
);

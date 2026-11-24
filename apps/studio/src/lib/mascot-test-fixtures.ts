import type { MascotStore } from "@/lib/mascot-store";

import { EMPTY_CELL, GRID } from "openmascot";

import { createMascotStore } from "@/lib/mascot-store";
import { colorChar } from "@/lib/pose-utils";
import { createBlankMascot } from "@/lib/samples";

/* Stores and gestures shared by the reducer and autosave tests. */

export const W = GRID.w;
export const INK = colorChar(1);
export const EMPTY = EMPTY_CELL;

/** Fixed colors, so tests don't depend on the blank mascot's random one. */
export const PALETTE = ["#141413", "#d97757", "#be684d", "#699acb"];

/** A store holding a fresh blank mascot: one blank "default" pose, four colors, one move: "bounce". */
export const setup = (): MascotStore => {
  const store = createMascotStore();
  store.dispatch({ type: "open-saved", doc: { ...createBlankMascot(), palette: PALETTE } });
  return store;
};

/** A drag across cells, sent the way the pixelboard sends it: the first cell opens the step. */
export const stroke = (
  store: MascotStore,
  cells: [number, number][],
  { pose = "default", ch = INK, mirror = false } = {}
) =>
  cells.forEach(([x, y], i) =>
    store.dispatch({ type: "paint-cell", pose, x, y, ch, commit: i === 0, mirror })
  );

/** One color-picker drag on an existing swatch, tick by tick. */
export const pickColor = (store: MascotStore, index: number, hexes: string[]) =>
  hexes.forEach((hex, i) => store.dispatch({ type: "set-palette", index, hex, commit: i === 0 }));

/** A store holding a fresh, unsaved blank draft with fixed colors. */
export const draftStore = (): MascotStore => {
  const store = createMascotStore();
  store.dispatch({
    type: "open-draft",
    doc: { ...createBlankMascot(), palette: PALETTE },
    from: "blank"
  });
  return store;
};

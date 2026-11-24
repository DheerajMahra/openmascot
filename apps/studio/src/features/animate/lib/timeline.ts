import type { MascotFrame } from "openmascot";

import { holdTicks } from "openmascot";

/** Expanded frame index (one per tick) where step `index` starts. */
export const startTick = (frames: MascotFrame[], index: number): number =>
  frames.slice(0, index).reduce((sum, f) => sum + holdTicks(f), 0);

/** Which step owns expanded frame `tick`, or null past the end. */
export const stepAtTick = (frames: MascotFrame[], tick: number): number | null => {
  let sum = 0;
  for (let i = 0; i < frames.length; i++) {
    sum += holdTicks(frames[i]);
    if (tick < sum) return i;
  }
  return null;
};

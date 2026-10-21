import type { MascotFrame } from "@openmascot/embed";

/** How many ticks a step is held for; anything invalid counts as one. */
export const holdOf = (frame: MascotFrame | undefined): number =>
  Math.max(1, Math.floor(frame?.hold ?? 1) || 1);

/** Expanded frame index (one per tick) where step `index` starts. */
export const startTick = (frames: MascotFrame[], index: number): number =>
  frames.slice(0, index).reduce((sum, f) => sum + holdOf(f), 0);

/** Which step owns expanded frame `tick`, or null past the end. */
export const stepAtTick = (frames: MascotFrame[], tick: number): number | null => {
  let sum = 0;
  for (let i = 0; i < frames.length; i++) {
    sum += holdOf(frames[i]);
    if (tick < sum) return i;
  }
  return null;
};

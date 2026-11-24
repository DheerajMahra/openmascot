import type { MascotFrame } from "./types";

/*
 * The rules of the mascot format (ADR-002) that every reader needs. The studio and the site
 * import these rather than restating them, so they can't drift from what the runtime plays.
 */

/** The grid every mascot is drawn on. `grid` stays in each doc so the file describes itself. */
export const GRID = { w: 24, h: 16 } as const;

/** Pose cells hold one base-36 character per palette index, so a palette has at most 36 colors. */
export const MAX_COLORS = 36;

/** A transparent cell in a pose string. */
export const EMPTY_CELL = ".";

/** Milliseconds per tick when a doc doesn't give a usable `tick`. */
export const DEFAULT_TICK = 60;

/**
 * The longest a single step can stay on screen, in ticks: 7.2 s at the default tick. Hold a pose
 * longer by repeating the step. Also what keeps a hand-edited `"hold": 1e309` from expanding into
 * an endless list of ticks.
 */
export const MAX_HOLD = 120;

/**
 * How many ticks a step stays on screen, from 1 to MAX_HOLD. Docs are hand-editable JSON, so a hold
 * below one, or one that isn't a number, counts as one, and anything longer counts as MAX_HOLD.
 */
export const holdTicks = (frame: MascotFrame | undefined): number =>
  Math.min(MAX_HOLD, Math.max(1, Math.floor(frame?.hold ?? 1) || 1));

/** How many ticks a whole move lasts. */
export const sequenceTicks = (frames: readonly MascotFrame[]): number =>
  frames.reduce((sum, frame) => sum + holdTicks(frame), 0);

export { Animator, expandSequence } from "./animator";
export { MASCOT_TAG, MascotElement, defineMascotElement, emit, play } from "./element";
export type { MascotTarget } from "./element";
export { parseMascotDoc } from "./parse";
export { MascotPlayer, prefersReducedMotion } from "./player";
export {
  DEFAULT_TICK,
  EMPTY_CELL,
  GRID,
  MAX_COLORS,
  MAX_HOLD,
  holdTicks,
  sequenceTicks
} from "./format";
export { frameShift, poseToDataUrl, rasterizePose } from "./renderer";
export type { FrameShift } from "./renderer";
export { formatTrigger, parseTrigger } from "./triggers";
export type { ParsedTrigger, TriggerType } from "./triggers";
export type {
  MascotDoc,
  MascotFrame,
  MascotOptions,
  MascotPosition,
  MascotSequence
} from "./types";

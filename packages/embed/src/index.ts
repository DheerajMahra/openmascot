export { Animator, expandSequence } from "./animator";
export { MASCOT_TAG, MascotElement, defineMascotElement, emit, play } from "./element";
export type { MascotTarget } from "./element";
export { MascotPlayer, prefersReducedMotion } from "./player";
export { EMPTY_CELL, poseToDataUrl, rasterizePose, sequencePadding } from "./renderer";
export type { MascotPadding } from "./renderer";
export { parseTrigger } from "./triggers";
export type { ParsedTrigger } from "./triggers";
export type {
  MascotDoc,
  MascotFrame,
  MascotOptions,
  MascotPosition,
  MascotSequence
} from "./types";

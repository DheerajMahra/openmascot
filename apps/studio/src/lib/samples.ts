import type { MascotDoc } from "openmascot";

import { clawd, moss } from "@openmascot/samples";
import { DEFAULT_TICK, GRID } from "openmascot";

import { UNTITLED } from "@/lib/doc-edits";
import { blankPose, newId, randomPaintColor } from "@/lib/pose-utils";
import { MOVE_PRESETS } from "@/lib/presets";

export interface Sample {
  /** Names the sample in a starting-point URL (`?from=clawd`). */
  key: "clawd" | "moss";
  doc: MascotDoc;
  blurb: string;
  /** Rights note shown behind an info icon on the sample's tile. */
  notice?: string;
}

/** Starter mascots. Each one shows a different palette, pose set and animation style. */
export const SAMPLES: Sample[] = [
  {
    key: "clawd",
    doc: clawd,
    blurb: "The official Claude Code mascot.",
    notice: "Clawd is a trademark of Anthropic, PBC. OpenMascot is not affiliated with Anthropic."
  },
  {
    key: "moss",
    doc: moss,
    blurb: "Green slime. Hops, stretches, melts into a puddle."
  }
];

/** A blank mascot starts with Bounce, so whatever gets drawn has a move to try right away. */
export const createBlankMascot = (): MascotDoc => {
  const grid = { ...GRID };
  const bounce = MOVE_PRESETS.find(p => p.id === "bounce")?.frames ?? [];
  return {
    id: newId(),
    name: UNTITLED,
    version: 1,
    grid,
    tick: DEFAULT_TICK,
    palette: [randomPaintColor()],
    poses: { default: blankPose(grid.w, grid.h) },
    sequences: { bounce: bounce.map(f => ({ ...f })) },
    triggers: {}
  };
};

/** A fresh copy with its own id, so edits never touch the sample. */
export const cloneSample = (sample: Sample, id = newId()): MascotDoc => ({
  ...structuredClone(sample.doc),
  id
});

/** What a new mascot can start from: a blank canvas or one of the samples. */
export type StartFrom = "blank" | Sample["key"];

export const isStartFrom = (value: unknown): value is StartFrom =>
  value === "blank" || SAMPLES.some(s => s.key === value);

/** A new mascot from a starting point, under an id the URL already carries. */
export const startDoc = (from: StartFrom, id: string): MascotDoc => {
  const sample = SAMPLES.find(s => s.key === from);
  return sample ? cloneSample(sample, id) : { ...createBlankMascot(), id };
};

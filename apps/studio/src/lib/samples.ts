import type { MascotDoc } from "@openmascot/embed";

import { createBlankMascot } from "@/lib/mascot-store";
import { newId } from "@/lib/pose-utils";
import clawd from "@/samples/clawd.json";
import moss from "@/samples/moss.json";

export interface Sample {
  /** Names the sample in a starting-point URL (`?from=clawd`). */
  key: "clawd" | "moss";
  doc: MascotDoc;
  blurb: string;
}

/** Starter mascots. Each one shows a different palette, pose set and animation style. */
export const SAMPLES: Sample[] = [
  { key: "clawd", doc: clawd as unknown as MascotDoc, blurb: "The official Claude Code mascot." },
  {
    key: "moss",
    doc: moss as unknown as MascotDoc,
    blurb: "Green slime. Squishes, hops, winks, melts."
  }
];

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

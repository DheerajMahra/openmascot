import type { MascotDoc } from "@openmascot/embed";

import { newId } from "@/lib/pose-utils";
import clawd from "@/samples/clawd.json";
import moss from "@/samples/moss.json";

export interface Sample {
  doc: MascotDoc;
  blurb: string;
}

/** Starter mascots. Each one shows a different palette, pose set and animation style. */
export const SAMPLES: Sample[] = [
  { doc: clawd as unknown as MascotDoc, blurb: "The official Claude Code mascot." },
  { doc: moss as unknown as MascotDoc, blurb: "Green slime. Squishes, hops, winks, melts." }
];

/** A fresh copy with its own id, so edits never touch the sample. */
export const cloneSample = (sample: Sample): MascotDoc => ({
  ...structuredClone(sample.doc),
  id: newId()
});

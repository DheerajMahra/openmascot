import type { MascotDoc } from "@openmascot/embed";

import blobby from "@openmascot/embed/demo/mascot.json";
import byte from "@openmascot/embed/samples/byte.json";
import moss from "@openmascot/embed/samples/moss.json";
import pip from "@openmascot/embed/samples/pip.json";
import tappy from "@openmascot/embed/samples/tappy.json";

import { newId } from "@/lib/pose-utils";

export interface Sample {
  doc: MascotDoc;
  blurb: string;
}

/** Starter mascots. Each one shows a different palette, pose set and animation style. */
export const SAMPLES: Sample[] = [
  { doc: blobby as unknown as MascotDoc, blurb: "Clay blob. Jumps, looks around, celebrates." },
  { doc: byte as unknown as MascotDoc, blurb: "Blue robot. Blinks, beeps its antenna, scans." },
  { doc: moss as unknown as MascotDoc, blurb: "Green slime. Squishes, hops, winks, melts." },
  { doc: pip as unknown as MascotDoc, blurb: "Pink bunny. Flaps ears, dances, startles." },
  {
    doc: tappy as unknown as MascotDoc,
    blurb: "Yellow critter. Pulls out a laptop, types, waves."
  }
];

/** A fresh copy with its own id, so edits never touch the sample. */
export const cloneSample = (sample: Sample): MascotDoc => ({
  ...structuredClone(sample.doc),
  id: newId()
});

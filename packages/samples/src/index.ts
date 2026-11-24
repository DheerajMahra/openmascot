import type { MascotDoc } from "openmascot";

import { parseMascotDoc } from "openmascot";

import clawdJson from "./clawd.json";
import mossJson from "./moss.json";

/** A sample as the runtime reads it. A broken sample file fails here, at import, not mid-render. */
const sample = (json: unknown, file: string): MascotDoc => {
  const doc = parseMascotDoc(json);
  if (!doc) throw new Error(`@openmascot/samples: ${file} is not a valid mascot document`);
  return doc;
};

/** Clawd, the official Claude Code mascot. */
export const clawd = sample(clawdJson, "clawd.json");

/** Moss, a green slime that hops, stretches, melts into a puddle and ripples. */
export const moss = sample(mossJson, "moss.json");

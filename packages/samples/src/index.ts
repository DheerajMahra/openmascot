import type { MascotDoc } from "openmascot";

import clawdJson from "./clawd.json";
import mossJson from "./moss.json";

// JSON imports type the docs loosely, so they are asserted to the runtime type.
/** Clawd, the official Claude Code mascot. */
export const clawd = clawdJson as unknown as MascotDoc;

/** Moss, a green slime that hops, stretches, melts into a puddle and ripples. */
export const moss = mossJson as unknown as MascotDoc;

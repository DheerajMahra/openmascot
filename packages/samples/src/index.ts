import type { MascotDoc } from "@openmascot/embed";

import clawdJson from "./clawd.json";
import mossJson from "./moss.json";

// JSON imports type the docs loosely, so they are asserted to the runtime type.
/** Clawd, the official Claude Code mascot. */
export const clawd = clawdJson as unknown as MascotDoc;

/** Moss, a green slime that squishes, hops, winks and melts. */
export const moss = mossJson as unknown as MascotDoc;

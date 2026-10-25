import type { MascotDoc } from "@openmascot/embed";

import clawdJson from "./clawd.json";
import mossJson from "./moss.json";

// JSON imports widen the frame `poof` field to string, so the docs are asserted to the runtime type.
/** Clawd, the official Claude Code mascot. */
export const clawd = clawdJson as unknown as MascotDoc;

/** Moss, a green slime that squishes, hops, winks and melts. */
export const moss = mossJson as unknown as MascotDoc;

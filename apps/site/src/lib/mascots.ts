import type { MascotDoc } from "@openmascot/embed";

import { clawd, moss } from "@openmascot/samples";

/**
 * Nothing on the site moves on a timer: interval triggers come off. A click (or Enter on the
 * button around the mascot) plays its happiest move, and `Mascot.emit("success")` plays the
 * success move, the same one unless given.
 */
const forSite = (doc: MascotDoc, happy: string, success = happy): MascotDoc => ({
  ...doc,
  triggers: {
    ...Object.fromEntries(
      Object.entries(doc.triggers).filter(([key]) => !key.startsWith("interval:"))
    ),
    click: happy,
    "custom:success": success
  }
});

export const CLAWD = forSite(clawd, "celebrate", "excited");
export const MOSS = forSite(moss, "wave");

/** Both mascots, for the parade and the send-off. */
export const CAST = [CLAWD, MOSS];

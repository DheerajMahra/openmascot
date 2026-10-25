import type { MascotDoc } from "@openmascot/embed";

import { clawd, moss } from "@openmascot/samples";

/**
 * Nothing on the site moves on a timer: interval triggers come off. A click (or Enter on the
 * button around the mascot) plays its happiest move, and `Mascot.emit("success")` does too.
 */
const forSite = (doc: MascotDoc, happy: string): MascotDoc => ({
  ...doc,
  triggers: {
    ...Object.fromEntries(
      Object.entries(doc.triggers).filter(([key]) => !key.startsWith("interval:"))
    ),
    click: happy,
    "custom:success": happy
  }
});

export const CLAWD = forSite(clawd, "celebrate");
export const MOSS = forSite(moss, "hop");

/** Both mascots, for the parade and the send-off. */
export const CAST = [CLAWD, MOSS];

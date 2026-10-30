import type { MascotDoc } from "openmascot";

import { clawd, moss } from "@openmascot/samples";

/**
 * A click (or Enter on the button around the mascot) plays its happiest move, and
 * `Mascot.emit("success")` plays the success move, the same one unless given.
 */
const forSite = (doc: MascotDoc, happy: string, success = happy): MascotDoc => ({
  ...doc,
  triggers: {
    ...doc.triggers,
    click: happy,
    "custom:success": success
  }
});

/** Without the studio's timer, so the mascot moves only when someone hovers or clicks. */
const still = (doc: MascotDoc): MascotDoc => ({
  ...doc,
  triggers: Object.fromEntries(
    Object.entries(doc.triggers).filter(([key]) => !key.startsWith("interval:"))
  )
});

/** Live: with the studio's every-6-seconds move. Only the hero and the send-off use these. */
export const LIVE_CLAWD = forSite(clawd, "celebrate", "excited");
export const LIVE_MOSS = forSite(moss, "wave");

export const CLAWD = still(LIVE_CLAWD);
export const MOSS = still(LIVE_MOSS);

/** Both mascots, for the parade. */
export const CAST = [CLAWD, MOSS];

/** Both mascots, live, for the send-off. */
export const LIVE_CAST = [LIVE_CLAWD, LIVE_MOSS];

import type { MascotDoc } from "openmascot";

import { shortTrigger } from "@/lib/presets";

export interface TriggerChip {
  /** Key in doc.triggers, e.g. "click" or "interval:6". */
  key: string;
  /** When it fires, in a few words: "on click", "every 6 s". */
  label: string;
  /** Move it plays. */
  seq: string;
}

/** What the live preview offers to play: every move, and every trigger with its move. */
export const previewChips = (doc: MascotDoc): { moves: string[]; triggers: TriggerChip[] } => ({
  moves: Object.keys(doc.sequences),
  triggers: Object.entries(doc.triggers).map(([key, seq]) => ({
    key,
    label: shortTrigger(key),
    seq
  }))
});

import type { MascotFrame, TriggerType } from "openmascot";

import { formatTrigger, parseTrigger, sequenceTicks } from "openmascot";

/** Default hold for a step added by hand, in ticks. */
export const DEFAULT_HOLD = 4;

export const secondsOf = (frames: MascotFrame[], tick: number): string =>
  ((sequenceTicks(frames) * tick) / 1000).toFixed(2);

export interface MovePreset {
  id: string;
  label: string;
  frames: MascotFrame[];
}

/** One step of the default pose, moved `x` columns right and `y` rows up. */
const step = (hold: number, x = 0, y = 0): MascotFrame => ({
  pose: "default",
  hold,
  ...(x ? { x } : {}),
  ...(y ? { y } : {})
});

/**
 * Starting points for a new move. They only move the default pose up, down and sideways, so they
 * work on any mascot: nothing assumes it has eyes, arms or poses with particular names.
 */
export const MOVE_PRESETS: MovePreset[] = [
  {
    id: "bounce",
    label: "Start from Bounce",
    frames: [step(2, 0, 1), step(3), step(2, 0, 1), step(3)]
  },
  {
    id: "sway",
    label: "Start from Sway",
    frames: [step(4, -1), step(2), step(4, 1), step(2)]
  },
  {
    id: "empty",
    label: "Start empty",
    frames: [step(4)]
  }
];

/* --- Triggers vocabulary --- */

export const TRIGGER_KINDS: Array<{ id: TriggerType; label: string }> = [
  { id: "load", label: "page load" },
  { id: "click", label: "click" },
  { id: "hover", label: "hover" },
  { id: "interval", label: "every few seconds" },
  // Named after the call that fires it, so the row reads like the page code.
  { id: "custom", label: "Mascot.emit()" }
];

/**
 * A trigger key as the triggers table edits it: its kind, and its detail (seconds or event name)
 * as text. Read through the runtime's parser, so the table shows what the mascot will do.
 */
export const triggerParts = (key: string): { kind: TriggerType | null; param: string } => {
  const parsed = parseTrigger(key);
  if (!parsed) return { kind: null, param: "" };
  if (parsed.type === "interval") return { kind: "interval", param: String(parsed.seconds) };
  if (parsed.type === "custom") return { kind: "custom", param: parsed.name };
  return { kind: parsed.type, param: "" };
};

/** Event name a new Mascot.emit() trigger starts with. */
export const DEFAULT_EVENT = "success";
/** Seconds a new "every few seconds" trigger starts with. */
export const DEFAULT_INTERVAL = 6;

/** The key for a kind and its detail; an empty detail takes the default. */
export const buildTrigger = (kind: TriggerType, param: string): string => {
  if (kind === "interval") {
    return formatTrigger({ type: "interval", seconds: Number(param) || DEFAULT_INTERVAL });
  }
  if (kind === "custom") return formatTrigger({ type: "custom", name: param || DEFAULT_EVENT });
  return formatTrigger({ type: kind });
};

/**
 * The default key for a kind, bumped until no trigger in `taken` uses it, so a second
 * Mascot.emit() row becomes "custom:success-2" and a second interval "interval:7".
 */
export const uniqueTrigger = (kind: TriggerType, taken: Record<string, unknown>): string => {
  const first = buildTrigger(kind, "");
  if (!(first in taken)) return first;
  if (kind === "custom") {
    let n = 2;
    while (buildTrigger("custom", `${DEFAULT_EVENT}-${n}`) in taken) n++;
    return buildTrigger("custom", `${DEFAULT_EVENT}-${n}`);
  }
  if (kind === "interval") {
    let secs = DEFAULT_INTERVAL + 1;
    while (buildTrigger("interval", String(secs)) in taken) secs++;
    return buildTrigger("interval", String(secs));
  }
  return first;
};

/** Two or three words on one trigger, for the moves list: "on click", "every 9 s". */
export const shortTrigger = (key: string): string => {
  const { kind, param } = triggerParts(key);
  switch (kind) {
    case "load":
      return "on load";
    case "click":
      return "on click";
    case "hover":
      return "on hover";
    case "interval":
      return `every ${param} s`;
    case "custom":
      return `on "${param}"`;
    default:
      return key;
  }
};

/** One line on when a move plays, for the moves list. Empty when nothing triggers it. */
export const describeTriggers = (keys: string[]): string => keys.map(shortTrigger).join(", ");

import type { MascotFrame } from "@openmascot/embed";

/** Default hold for a step added by hand, in ticks. */
export const DEFAULT_HOLD = 4;

export const ticksOf = (frames: MascotFrame[]): number =>
  frames.reduce((sum, f) => sum + Math.max(1, Math.floor(f.hold) || 1), 0);

export const secondsOf = (frames: MascotFrame[], tick: number): string =>
  ((ticksOf(frames) * tick) / 1000).toFixed(2);

export interface MovePreset {
  id: string;
  label: string;
  /** Builds frames from the poses this mascot actually has. */
  build: (poses: string[]) => MascotFrame[];
}

/** Prefer a pose whose name matches, else fall back to default. */
const pick = (poses: string[], ...wanted: string[]): string => {
  for (const w of wanted) {
    const hit = poses.find(p => p === w || p.includes(w));
    if (hit) return hit;
  }
  return "default";
};

export const MOVE_PRESETS: MovePreset[] = [
  {
    id: "wave",
    label: "Start from Wave",
    build: poses => {
      const up = pick(poses, "arms-up", "wave", "arm");
      return [
        { pose: up, hold: 3 },
        { pose: "default", hold: 2 },
        { pose: up, hold: 3 },
        { pose: "default", hold: 1 }
      ];
    }
  },
  {
    id: "jump",
    label: "Start from Jump",
    build: poses => {
      const up = pick(poses, "arms-up", "jump", "tall");
      return [
        { pose: "default", hold: 2, offset: 1, poof: "dot" },
        { pose: up, hold: 3 },
        { pose: "default", hold: 1 },
        { pose: "default", hold: 2, offset: 1, poof: "wave" }
      ];
    }
  },
  {
    id: "look-around",
    label: "Start from Look around",
    build: poses => [
      { pose: pick(poses, "look-left", "left"), hold: 5 },
      { pose: pick(poses, "look-right", "right"), hold: 5 },
      { pose: "default", hold: 2 }
    ]
  },
  {
    id: "bounce",
    label: "Start from Bounce",
    build: () => [
      { pose: "default", hold: 2, offset: 1 },
      { pose: "default", hold: 3 },
      { pose: "default", hold: 2, offset: 1 },
      { pose: "default", hold: 3 }
    ]
  },
  {
    id: "nod",
    label: "Start from Nod",
    build: poses => {
      const happy = pick(poses, "happy", "blink", "wink");
      return [
        { pose: "default", hold: 3 },
        { pose: happy, hold: 2, offset: 1 },
        { pose: "default", hold: 3 },
        { pose: happy, hold: 2, offset: 1 }
      ];
    }
  },
  {
    id: "empty",
    label: "Start empty",
    build: () => [{ pose: "default", hold: 4 }]
  }
];

/* --- Triggers vocabulary --- */

export type TriggerKind = "load" | "click" | "hover" | "interval" | "custom";

export const TRIGGER_KINDS: Array<{ id: TriggerKind; label: string }> = [
  { id: "load", label: "page load" },
  { id: "click", label: "click" },
  { id: "hover", label: "hover" },
  { id: "interval", label: "every few seconds" },
  { id: "custom", label: "my site sends…" }
];

export const parseTrigger = (key: string | null): { kind: TriggerKind | null; param: string } => {
  if (!key) return { kind: null, param: "" };
  if (key.startsWith("interval:")) return { kind: "interval", param: key.slice(9) };
  if (key.startsWith("custom:")) return { kind: "custom", param: key.slice(7) };
  if (key === "click" || key === "hover" || key === "load") return { kind: key, param: "" };
  return { kind: null, param: "" };
};

export const buildTrigger = (kind: TriggerKind, param: string): string => {
  if (kind === "interval") return `interval:${param || "8"}`;
  if (kind === "custom") return `custom:${param || "event"}`;
  return kind;
};

/** Two or three words on one trigger, for the moves list: "on click", "every 9 s". */
export const shortTrigger = (key: string): string => {
  const { kind, param } = parseTrigger(key);
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

/** One line on when a move plays, for the moves list. */
export const describeTriggers = (keys: string[]): string => {
  if (keys.length === 0) return "no trigger";
  return keys.map(shortTrigger).join(", ");
};

/** One step of a sequence. `hold` is how many ticks the pose stays on screen. */
export interface MascotFrame {
  pose: string;
  hold: number;
  /** Rows to push the drawing down. Reads as a crouch. */
  offset?: number;
  /** Columns to push the drawing right (negative = left). Reads as a slide. */
  x?: number;
  /** Small puff marks at the feet. */
  poof?: "dot" | "wave" | null;
}

export type MascotSequence = MascotFrame[];

/**
 * The whole mascot. Poses are strings with one character per cell, row by row:
 * "." is transparent, any other character is a base-36 palette index.
 */
export interface MascotDoc {
  id: string;
  name: string;
  version: number;
  grid: { w: number; h: number };
  /** Milliseconds per animation tick. */
  tick: number;
  palette: string[];
  poses: Record<string, string>;
  sequences: Record<string, MascotSequence>;
  /**
   * Event → sequence name. Keys: "load", "click", "hover", "idle",
   * "interval:<seconds>", "custom:<name>".
   */
  triggers: Record<string, string>;
}

export type MascotPosition = "bottom-right" | "bottom-left";

export interface MascotOptions {
  /** Screen pixels per mascot cell. Default 4. */
  scale?: number;
  /** Fixed corner placement. Omit to render inline where the element sits. */
  position?: MascotPosition | null;
  /** Force reduced motion on or off. Defaults to the OS preference. */
  reducedMotion?: boolean;
  /** Wire the doc's triggers (click, hover, intervals, load). Default true. */
  triggers?: boolean;
}

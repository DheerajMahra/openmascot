import type { MascotDoc, MascotFrame } from "./types";

export const REST_FRAME: MascotFrame = { pose: "default", hold: 1 };

/** `{ pose, hold: 3 }` becomes three identical frames so playback is one index per tick. */
export const expandSequence = (seq: MascotFrame[] | undefined): MascotFrame[] => {
  const frames: MascotFrame[] = [];
  for (const f of seq ?? []) {
    const n = Math.max(1, Math.floor(f.hold) || 1);
    for (let i = 0; i < n; i++) frames.push(f);
  }
  return frames;
};

export const idleName = (doc: MascotDoc): string => doc.triggers?.idle ?? "idle";

/**
 * Playback state, and nothing else: which sequence is current and which frame is showing.
 * No DOM and no timers, so the player drives it and tests can step it directly.
 * `index === -1` means resting on the default pose.
 */
export class Animator {
  current: string | null = null;
  index = -1;

  private seqs: Record<string, MascotFrame[]> = {};
  private frames: MascotFrame[] = [];
  private idle = "idle";

  /**
   * Swap the document. Keeps the current sequence when it still exists.
   * Returns true when the playing sequence vanished, so the caller can restart idle.
   */
  load(doc: MascotDoc): boolean {
    this.idle = idleName(doc);
    this.seqs = {};
    for (const name of Object.keys(doc.sequences)) {
      this.seqs[name] = expandSequence(doc.sequences[name]);
    }
    const keep = this.current ? this.seqs[this.current] : undefined;
    if (keep && keep.length) {
      this.frames = keep;
      this.index = Math.min(this.index, keep.length - 1);
      return false;
    }
    if (this.current !== null) {
      this.current = null;
      this.index = -1;
      this.frames = [];
      return true;
    }
    return false;
  }

  get idleSequence(): string {
    return this.idle;
  }

  /** The frame to draw right now. */
  get frame(): MascotFrame {
    return this.index >= 0 ? (this.frames[this.index] ?? REST_FRAME) : REST_FRAME;
  }

  /** True while something other than idle is playing. */
  get busy(): boolean {
    return this.current !== null && this.current !== this.idle;
  }

  frameCount(name: string): number {
    return this.seqs[name]?.length ?? 0;
  }

  /** Switch to a sequence from its first frame. False when it is missing or empty. */
  play(name: string): boolean {
    const frames = this.seqs[name];
    if (!frames || frames.length === 0) return false;
    this.current = name;
    this.frames = frames;
    this.index = 0;
    return true;
  }

  /** Drop back to the resting pose without leaving the current sequence. */
  rest(): void {
    this.index = -1;
  }

  /** Jump to one frame of a sequence. */
  seek(name: string, index: number): boolean {
    const frames = this.seqs[name];
    if (!frames || frames.length === 0) return false;
    this.current = name;
    this.frames = frames;
    this.index = Math.max(0, Math.min(frames.length - 1, index));
    return true;
  }

  /**
   * Move to the next frame. At the end, a non-idle sequence hands over to idle;
   * idle (or a missing idle) loops.
   */
  advance(): void {
    this.index++;
    if (this.index < this.frames.length) return;
    if (this.current !== this.idle && this.play(this.idle)) return;
    this.index = 0;
  }
}

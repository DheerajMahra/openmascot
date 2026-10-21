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

  /**
   * Swap the document. Keeps the current sequence when it still exists.
   * Returns true when the playing sequence vanished, so the caller can stop its timer.
   */
  load(doc: MascotDoc): boolean {
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
      this.stop();
      return true;
    }
    return false;
  }

  /** The frame to draw right now. */
  get frame(): MascotFrame {
    return this.index >= 0 ? (this.frames[this.index] ?? REST_FRAME) : REST_FRAME;
  }

  /** True while a sequence is playing or held on one of its frames. */
  get busy(): boolean {
    return this.current !== null;
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

  /** Leave the current sequence and rest on the default pose. */
  stop(): void {
    this.current = null;
    this.frames = [];
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

  /** Move to the next frame. Every sequence plays once, then rests on the default pose. */
  advance(): void {
    this.index++;
    if (this.index >= this.frames.length) this.stop();
  }
}

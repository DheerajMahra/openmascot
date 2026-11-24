import type { MascotDoc, MascotOptions } from "./types";

import { Animator } from "./animator";
import { DEFAULT_TICK } from "./format";
import { Renderer } from "./renderer";
import { TriggerManager } from "./triggers";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Whether two trigger maps play the same move for the same events. Key order doesn't matter, and
 * comparing entry by entry builds no strings: setDoc runs on every edit in the studio.
 */
const sameTriggers = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(b, key) && a[key] === b[key])
  );
};

/**
 * Plays a mascot inside an element. A thin facade: the Animator holds playback state,
 * the Renderer draws it, the TriggerManager reacts to events. This class owns the timer
 * and the DOM mount.
 */
export class MascotPlayer {
  readonly el: HTMLElement;

  private doc!: MascotDoc;
  private readonly animator = new Animator();
  private readonly renderer: Renderer;
  private triggers: TriggerManager | null = null;
  /** A copy of the trigger map the current listeners were built from, to rebuild only on a change. */
  private wiredTriggers: Record<string, string> | null = null;
  /** Set by destroy(). A destroyed player never takes a doc or wires listeners again. */
  private destroyed = false;
  private readonly wantsTriggers: boolean;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private reduced: boolean;

  constructor(el: HTMLElement, doc: MascotDoc, opts: MascotOptions = {}) {
    this.el = el;
    this.reduced = opts.reducedMotion ?? prefersReducedMotion();
    this.wantsTriggers = opts.triggers !== false;
    this.renderer = new Renderer(opts.scale ?? 4);

    if (opts.position) {
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.bottom = "16px";
      el.style[opts.position === "bottom-left" ? "left" : "right"] = "16px";
    }
    el.style.lineHeight = "0";
    el.appendChild(this.renderer.canvas);

    this.setDoc(doc);
    // Load fires once, when the mascot first appears, not on later doc swaps.
    const load = this.wantsTriggers ? doc.triggers?.load : undefined;
    if (load) this.play(load);
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  /** Name of the sequence that is playing, or null at rest. */
  get current(): string | null {
    return this.animator.current;
  }

  /**
   * Swap the document in place. Keeps the current sequence playing when it still exists, and
   * rewires click, hover and interval triggers when the doc's trigger map changed. Does nothing
   * once the player is destroyed.
   */
  setDoc(doc: MascotDoc): void {
    if (this.destroyed) return;
    this.doc = doc;
    const lost = this.animator.load(doc);
    this.renderer.setDoc(doc);
    if (lost) this.stopTimer();
    this.wireTriggers();
    this.draw();
  }

  setScale(scale: number): void {
    this.renderer.setScale(scale);
    this.draw();
  }

  /** Start a sequence. It plays once, then the mascot rests on its default pose. */
  play(name: string): boolean {
    if (!this.animator.play(name)) return false;
    this.stopTimer();
    if (this.reduced) {
      this.animator.stop();
      this.draw();
    } else {
      this.step();
    }
    return true;
  }

  /** Jump to one frame of a sequence and hold it. For scrubbing in an editor. */
  showFrame(name: string, index: number): void {
    if (!this.animator.seek(name, index)) return;
    this.stopTimer();
    this.draw();
  }

  frameCount(name: string): number {
    return this.animator.frameCount(name);
  }

  /** Index into the expanded frames of the current sequence, or -1 at rest. */
  currentIndex(): number {
    return this.animator.index;
  }

  isPlaying(): boolean {
    return this.timer !== null;
  }

  pause(): void {
    this.stopTimer();
  }

  resume(): void {
    if (this.timer === null && this.animator.current) this.step();
  }

  /** Fire a `custom:<name>` trigger. */
  emit(name: string): boolean {
    const seq = this.doc.triggers?.[`custom:${name}`];
    return seq ? this.play(seq) : false;
  }

  isBusy(): boolean {
    return this.animator.busy;
  }

  destroy(): void {
    this.destroyed = true;
    this.stopTimer();
    this.unwireTriggers();
    this.renderer.destroy();
  }

  /** Rebuilds the trigger listeners from the doc, unless they already match it. */
  private wireTriggers(): void {
    if (!this.wantsTriggers) return;
    const map = this.doc.triggers ?? {};
    // Same triggers: keep the listeners, so interval timers aren't restarted by unrelated edits.
    if (this.wiredTriggers && sameTriggers(map, this.wiredTriggers)) return;
    this.unwireTriggers();
    this.triggers = new TriggerManager(this, map);
    this.triggers.attach();
    // A copy, so a caller that edits the same object in place still counts as a change.
    this.wiredTriggers = { ...map };
  }

  private unwireTriggers(): void {
    this.triggers?.detach();
    this.triggers = null;
    this.wiredTriggers = null;
  }

  private stopTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  private step(): void {
    this.draw();
    if (this.animator.current === null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.animator.advance();
      this.step();
    }, this.doc.tick || DEFAULT_TICK);
  }

  private draw(): void {
    this.renderer.draw(this.animator.frame);
  }
}

import type { MascotDoc, MascotOptions } from "./types";

import { Animator } from "./animator";
import { Renderer } from "./renderer";
import { TriggerManager } from "./triggers";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  private timer: ReturnType<typeof setTimeout> | null = null;
  private reduced: boolean;

  constructor(el: HTMLElement, doc: MascotDoc, opts: MascotOptions = {}) {
    this.el = el;
    this.reduced = opts.reducedMotion ?? prefersReducedMotion();
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
    if (opts.triggers !== false) {
      this.triggers = new TriggerManager(this, doc.triggers ?? {});
      this.triggers.attach();
      this.play(doc.triggers?.load ?? this.animator.idleSequence);
    } else {
      this.play(this.animator.idleSequence);
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.canvas;
  }

  /** Name of the sequence that is playing, or null at rest. */
  get current(): string | null {
    return this.animator.current;
  }

  /** Swap the document in place. Keeps the current sequence playing when it still exists. */
  setDoc(doc: MascotDoc): void {
    this.doc = doc;
    const lost = this.animator.load(doc);
    this.renderer.setDoc(doc);
    if (lost && this.timer === null) this.play(this.animator.idleSequence);
    this.draw();
  }

  setScale(scale: number): void {
    this.renderer.setScale(scale);
    this.draw();
  }

  /** Start a sequence. Non-idle sequences play once, then fall back to idle. */
  play(name: string): boolean {
    if (!this.animator.play(name)) return false;
    this.stopTimer();
    if (this.reduced) {
      this.animator.rest();
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
    this.stopTimer();
    this.triggers?.detach();
    this.triggers = null;
    this.renderer.destroy();
  }

  private stopTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  private step(): void {
    this.draw();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.animator.advance();
      this.step();
    }, this.doc.tick || 60);
  }

  private draw(): void {
    this.renderer.draw(this.animator.frame);
  }
}

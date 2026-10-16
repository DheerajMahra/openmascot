import type { MascotDoc, MascotFrame, MascotOptions } from "./types";

export const EMPTY_CELL = ".";
const REST_FRAME: MascotFrame = { pose: "default", hold: 1 };

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

/** Turn one pose string into a canvas the size of the grid, one canvas pixel per cell. */
export const rasterizePose = (doc: MascotDoc, pose: string): HTMLCanvasElement => {
  const { w, h } = doc.grid;
  const str = doc.poses[pose] ?? "";
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const ch = str[i];
    if (!ch || ch === EMPTY_CELL) continue;
    const hex = doc.palette[parseInt(ch, 36)] ?? "#000000";
    const [r, g, b] = hexToRgb(hex);
    img.data[i * 4] = r;
    img.data[i * 4 + 1] = g;
    img.data[i * 4 + 2] = b;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
};

/** A scaled PNG of one pose, for thumbnails and exports. */
export const poseToDataUrl = (doc: MascotDoc, pose: string, scale = 8): string => {
  const src = rasterizePose(doc, pose);
  const out = document.createElement("canvas");
  out.width = src.width * scale;
  out.height = src.height * scale;
  const ctx = out.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
};

/** `{ pose, hold: 3 }` becomes three identical frames so playback is one index per tick. */
export const expandSequence = (seq: MascotFrame[] | undefined): MascotFrame[] => {
  const frames: MascotFrame[] = [];
  for (const f of seq ?? []) {
    const n = Math.max(1, Math.floor(f.hold) || 1);
    for (let i = 0; i < n; i++) frames.push(f);
  }
  return frames;
};

/** Slack around the grid, in cells, so every frame's offset and slide stays on the canvas. */
export interface MascotPadding {
  left: number;
  right: number;
  up: number;
  down: number;
}

/**
 * How far frames push the drawing outside its grid. Always at least one column each side
 * and one row below, so a mascot without any offsets draws the same as before.
 */
export const sequencePadding = (doc: MascotDoc): MascotPadding => {
  const pad: MascotPadding = { left: 1, right: 1, up: 0, down: 1 };
  for (const seq of Object.values(doc.sequences ?? {})) {
    for (const f of seq) {
      const x = Math.round(f.x ?? 0);
      const y = Math.round(f.offset ?? 0);
      pad.left = Math.max(pad.left, -x);
      pad.right = Math.max(pad.right, x);
      pad.up = Math.max(pad.up, -y);
      pad.down = Math.max(pad.down, y);
    }
  }
  return pad;
};

/**
 * Plays a mascot inside an element. One canvas, one timer, one index.
 * `index === -1` means resting on the default pose.
 */
export class MascotPlayer {
  readonly el: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  current: string | null = null;

  private ctx: CanvasRenderingContext2D;
  private doc!: MascotDoc;
  private poses: Record<string, HTMLCanvasElement> = {};
  private seqs: Record<string, MascotFrame[]> = {};
  private customs: Record<string, string> = {};
  private frames: MascotFrame[] = [];
  private index = -1;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private intervals: ReturnType<typeof setInterval>[] = [];
  private listeners: Array<[string, EventListener]> = [];
  private scale: number;
  private reduced: boolean;
  private pad: MascotPadding = { left: 1, right: 1, up: 0, down: 1 };

  constructor(el: HTMLElement, doc: MascotDoc, opts: MascotOptions = {}) {
    this.el = el;
    this.scale = opts.scale ?? 4;
    this.reduced = opts.reducedMotion ?? prefersReducedMotion();

    this.canvas = document.createElement("canvas");
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.display = "block";
    this.canvas.setAttribute("role", "img");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("mascot: canvas 2d context unavailable");
    this.ctx = ctx;

    if (opts.position) {
      el.style.position = "fixed";
      el.style.zIndex = "9999";
      el.style.bottom = "16px";
      el.style[opts.position === "bottom-left" ? "left" : "right"] = "16px";
    }
    el.style.lineHeight = "0";
    el.appendChild(this.canvas);

    this.setDoc(doc);
    if (opts.triggers !== false) this.wireTriggers();
    else this.play(this.idleName());
  }

  /** Swap the document in place. Keeps the current sequence playing when it still exists. */
  setDoc(doc: MascotDoc): void {
    this.doc = doc;
    this.poses = {};
    for (const name of Object.keys(doc.poses)) this.poses[name] = rasterizePose(doc, name);
    this.seqs = {};
    for (const name of Object.keys(doc.sequences)) {
      this.seqs[name] = expandSequence(doc.sequences[name]);
    }
    this.customs = {};
    for (const [key, seq] of Object.entries(doc.triggers ?? {})) {
      if (key.startsWith("custom:")) this.customs[key.slice(7)] = seq;
    }
    this.canvas.setAttribute("aria-label", `${doc.name} mascot`);
    this.pad = sequencePadding(doc);
    this.resize();
    const keep = this.current ? this.seqs[this.current] : undefined;
    if (keep && keep.length) {
      this.frames = keep;
      this.index = Math.min(this.index, keep.length - 1);
    } else if (this.current !== null) {
      this.current = null;
      this.index = -1;
      if (this.timer === null) this.play(this.idleName());
    }
    this.draw();
  }

  setScale(scale: number): void {
    this.scale = scale;
    this.resize();
    this.draw();
  }

  /** Start a sequence. Non-idle sequences play once, then fall back to idle. */
  play(name: string): boolean {
    const frames = this.seqs[name];
    if (!frames || frames.length === 0) return false;
    this.stopTimer();
    this.current = name;
    this.frames = frames;
    this.index = 0;
    if (this.reduced) {
      this.index = -1;
      this.draw();
      return true;
    }
    this.step();
    return true;
  }

  /** Jump to one frame of a sequence and hold it. For scrubbing in an editor. */
  showFrame(name: string, index: number): void {
    const frames = this.seqs[name];
    if (!frames || frames.length === 0) return;
    this.stopTimer();
    this.current = name;
    this.frames = frames;
    this.index = Math.max(0, Math.min(frames.length - 1, index));
    this.draw();
  }

  frameCount(name: string): number {
    return this.seqs[name]?.length ?? 0;
  }

  /** Index into the expanded frames of the current sequence, or -1 at rest. */
  currentIndex(): number {
    return this.index;
  }

  isPlaying(): boolean {
    return this.timer !== null;
  }

  pause(): void {
    this.stopTimer();
  }

  resume(): void {
    if (this.timer === null && this.current) this.step();
  }

  /** Fire a `custom:<name>` trigger. */
  emit(name: string): boolean {
    const seq = this.customs[name];
    return seq ? this.play(seq) : false;
  }

  isBusy(): boolean {
    return this.current !== null && this.current !== this.idleName();
  }

  destroy(): void {
    this.stopTimer();
    for (const id of this.intervals) clearInterval(id);
    for (const [type, fn] of this.listeners) this.el.removeEventListener(type, fn);
    this.intervals = [];
    this.listeners = [];
    this.canvas.remove();
  }

  private idleName(): string {
    return this.doc.triggers?.idle ?? "idle";
  }

  private resize(): void {
    const { w, h } = this.doc.grid;
    const s = this.scale;
    const { left, right, up, down } = this.pad;
    this.canvas.width = (w + left + right) * s; // slack each side for slides
    this.canvas.height = (h + up + down) * s; // slack above for hops, below for crouches
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
    this.ctx.imageSmoothingEnabled = false;
  }

  private stopTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }

  private step(): void {
    this.draw();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.index++;
      if (this.index >= this.frames.length) {
        const idle = this.idleName();
        const idleFrames = this.seqs[idle];
        if (this.current !== idle && idleFrames && idleFrames.length) {
          this.play(idle);
          return;
        }
        this.index = 0;
      }
      this.step();
    }, this.doc.tick || 60);
  }

  private draw(): void {
    const { w, h } = this.doc.grid;
    const s = this.scale;
    const f = this.index >= 0 ? (this.frames[this.index] ?? REST_FRAME) : REST_FRAME;
    const pose = this.poses[f.pose] ?? this.poses["default"];
    const offset = ((f.offset ?? 0) + this.pad.up) * s;
    const x = ((f.x ?? 0) + this.pad.left) * s;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (pose) this.ctx.drawImage(pose, x, offset, w * s, h * s);
    if (f.poof) {
      this.ctx.fillStyle = "rgba(128,128,128,0.8)";
      const fy = (h - 1) * s + offset - (f.poof === "wave" ? s : 0);
      this.ctx.fillRect(x - s, fy, s, s);
      this.ctx.fillRect(x + w * s, fy, s, s);
    }
  }

  private on(type: string, fn: EventListener): void {
    this.el.addEventListener(type, fn);
    this.listeners.push([type, fn]);
  }

  private wireTriggers(): void {
    const t = this.doc.triggers ?? {};
    for (const [key, seq] of Object.entries(t)) {
      if (key === "idle" || key === "load" || key.startsWith("custom:")) continue;
      if (key === "click") this.on("click", () => this.play(seq));
      else if (key === "hover") {
        this.on("mouseenter", () => {
          if (!this.isBusy()) this.play(seq);
        });
      } else if (key.startsWith("interval:")) {
        const secs = parseFloat(key.slice(9)) || 5;
        this.intervals.push(
          setInterval(() => {
            if (!this.isBusy()) this.play(seq);
          }, secs * 1000)
        );
      }
    }
    this.el.style.cursor = t.click ? "pointer" : "";
    this.play(t.load ?? this.idleName());
  }
}

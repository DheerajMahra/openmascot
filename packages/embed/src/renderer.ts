import type { MascotDoc, MascotFrame } from "./types";

export const EMPTY_CELL = ".";

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

/** How a frame moves the mascot, in screen px at `scale`. */
export interface FrameShift {
  /** CSS translate of the canvas: right for +x. */
  dx: number;
  /** CSS translate of the canvas: up (negative) for +y. */
  dy: number;
  /** How far the drawing starts below the canvas top; the canvas bottom cuts it off. */
  sink: number;
}

/**
 * Whole cells from a frame's x or y. Docs are hand-editable JSON, so anything that isn't a
 * finite number counts as no move.
 */
const cells = (n: unknown): number =>
  typeof n === "number" && Number.isFinite(n) ? Math.round(n) : 0;

/**
 * Slides and hops move the whole canvas, so the mascot's box on the page never changes size.
 * Sinks are drawn lower inside the canvas, so its bottom edge, the floor, cuts them off.
 */
export const frameShift = (frame: MascotFrame, scale: number): FrameShift => {
  const x = cells(frame.x);
  const y = cells(frame.y);
  return { dx: x * scale, dy: y > 0 ? -y * scale : 0, sink: y < 0 ? -y * scale : 0 };
};

/** Owns the canvas: sizing, a rasterized-pose cache, and drawing one frame. */
export class Renderer {
  readonly canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;
  private doc!: MascotDoc;
  private poses = new Map<string, HTMLCanvasElement>();

  constructor(private scale: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.display = "block";
    this.canvas.setAttribute("role", "img");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("mascot: canvas 2d context unavailable");
    this.ctx = ctx;
  }

  setDoc(doc: MascotDoc): void {
    this.doc = doc;
    this.poses.clear();
    for (const name of Object.keys(doc.poses)) this.poses.set(name, rasterizePose(doc, name));
    this.canvas.setAttribute("aria-label", `${doc.name} mascot`);
    this.resize();
  }

  setScale(scale: number): void {
    this.scale = scale;
    this.resize();
  }

  draw(f: MascotFrame): void {
    const { w, h } = this.doc.grid;
    const s = this.scale;
    const pose = this.poses.get(f.pose) ?? this.poses.get("default");
    const { dx, dy, sink } = frameShift(f, s);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (pose) this.ctx.drawImage(pose, 0, sink, w * s, h * s);
    this.canvas.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : "";
  }

  destroy(): void {
    this.canvas.remove();
  }

  private resize(): void {
    // Always the grid: moves shift the canvas instead of growing it.
    this.canvas.width = this.doc.grid.w * this.scale;
    this.canvas.height = this.doc.grid.h * this.scale;
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
    this.ctx.imageSmoothingEnabled = false;
  }
}

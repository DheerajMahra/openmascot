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

/** Owns the canvas: sizing, a rasterized-pose cache, and drawing one frame. */
export class Renderer {
  readonly canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;
  private doc!: MascotDoc;
  private poses = new Map<string, HTMLCanvasElement>();
  private pad: MascotPadding = { left: 1, right: 1, up: 0, down: 1 };

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
    this.pad = sequencePadding(doc);
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

  destroy(): void {
    this.canvas.remove();
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
}

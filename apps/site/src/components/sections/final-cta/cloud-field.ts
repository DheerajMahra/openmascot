const COUNT = 36;
/** Screen pixels per speck pixel. */
const PIXEL = 6;
/** How far, in screen px, the nearest layer slides over the card's whole pass. */
const TRAVEL = 300;
const COLORS = [
  "--color-clay",
  "--color-moss",
  "--color-gold",
  "--color-leaf",
  "--color-line",
  "--color-line"
];

interface Speck {
  x: number;
  y: number;
  size: number;
  /** 0 is far and slow, 2 is near and fast. */
  layer: number;
  speed: number;
  alpha: number;
  color: string;
}

export interface CloudField {
  /** Re-seed for the canvas's current size. */
  resize: () => void;
  /** Draw for how far the card has scrolled through the screen, 0 to 1. */
  draw: (progress: number) => void;
  /** Nudge every speck sideways one step. */
  drift: () => void;
}

/** Coloured specks in three parallax layers on a low-resolution canvas. */
export const createCloudField = (canvas: HTMLCanvasElement): CloudField => {
  const ctx = canvas.getContext("2d");
  const styles = getComputedStyle(canvas);
  const colors = COLORS.map(name => styles.getPropertyValue(name).trim());
  let specks: Speck[] = [];
  let last = 0;

  const draw = (progress: number) => {
    last = progress;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const scroll = (progress * TRAVEL) / PIXEL;
    ctx.clearRect(0, 0, w, h);
    for (const p of specks) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      const y = p.y - scroll * (0.12 + p.layer * 0.1);
      ctx.fillRect(Math.round(p.x), Math.round(((y % h) + h) % h), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width / PIXEL));
    canvas.height = Math.max(1, Math.round(r.height / PIXEL));
    specks = Array.from({ length: COUNT }, (_, i) => {
      const layer = i % 3;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: layer === 2 ? 2 : 1,
        layer,
        speed: (0.02 + layer * 0.02) * (Math.random() < 0.5 ? -1 : 1),
        alpha: 0.35 + layer * 0.2,
        color: colors[i % colors.length] ?? ""
      };
    });
    draw(last);
  };

  const drift = () => {
    const w = canvas.width;
    for (const p of specks) {
      p.x += p.speed;
      if (p.x > w + 2) p.x = -2;
      if (p.x < -2) p.x = w + 2;
    }
  };

  return { resize, draw, drift };
};

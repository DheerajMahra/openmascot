import { EMPTY_CELL } from "@openmascot/embed";

export const blankPose = (w: number, h: number): string => EMPTY_CELL.repeat(w * h);

export const colorChar = (index: number): string => index.toString(36);

export const cellAt = (pose: string, w: number, x: number, y: number): string =>
  pose[y * w + x] ?? EMPTY_CELL;

export const setCell = (pose: string, w: number, x: number, y: number, ch: string): string => {
  const i = y * w + x;
  if (pose[i] === ch) return pose;
  return pose.slice(0, i) + ch + pose.slice(i + 1);
};

/** Four-way flood fill of the region containing (x, y). */
export const floodFill = (
  pose: string,
  w: number,
  h: number,
  x: number,
  y: number,
  ch: string
): string => {
  const target = cellAt(pose, w, x, y);
  if (target === ch) return pose;
  const cells = pose.split("");
  const stack: Array<[number, number]> = [[x, y]];
  while (stack.length) {
    const next = stack.pop();
    if (!next) break;
    const [cx, cy] = next;
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const i = cy * w + cx;
    if (cells[i] !== target) continue;
    cells[i] = ch;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  return cells.join("");
};

export const mirrorPose = (pose: string, w: number, h: number): string => {
  let out = "";
  for (let y = 0; y < h; y++) {
    out += pose
      .slice(y * w, (y + 1) * w)
      .split("")
      .toReversed()
      .join("");
  }
  return out;
};

/** Pad or trim a pose string to exactly w*h cells. */
export const normalizePose = (pose: string, w: number, h: number): string =>
  (pose + EMPTY_CELL.repeat(w * h)).slice(0, w * h);

export const newId = (): string => `m_${Math.random().toString(36).slice(2, 7)}`;

export const isHex = (value: string): boolean => /^#[0-9a-f]{6}$/i.test(value);

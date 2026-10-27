import { cn } from "@/lib/utils";

/** 8×8 (the hand is 12×12) bitmaps; X is a filled pixel. */
const ICONS = {
  star: [
    "...XX...",
    "...XX...",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    ".XXXXXX.",
    ".XX..XX.",
    "XX....XX"
  ],
  heart: [
    ".XX..XX.",
    "XXXXXXXX",
    "XXXXXXXX",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    "...XX...",
    "........"
  ],
  arrow: [
    "........",
    "....X...",
    ".....X..",
    "XXXXXXX.",
    "XXXXXXX.",
    ".....X..",
    "....X...",
    "........"
  ],
  play: [
    ".X......",
    ".XX.....",
    ".XXX....",
    ".XXXX...",
    ".XXXX...",
    ".XXX....",
    ".XX.....",
    ".X......"
  ],
  hand: [
    "....XX......",
    "....XX......",
    "....XX......",
    "....XXXX....",
    "....XXXXXX..",
    ".XX.XXXXXXX.",
    ".XXXXXXXXXX.",
    "..XXXXXXXXX.",
    "..XXXXXXXX..",
    "...XXXXXXX..",
    "...XXXXXXX..",
    "....XXXXX..."
  ]
} as const;

export type PixelIconName = keyof typeof ICONS;

const cells = (rows: readonly string[]) =>
  rows.flatMap((row, y) => [...row].flatMap((c, x) => (c === "X" ? [{ x, y }] : [])));

/** A crisp pixel-art icon in the current text color. Decorative: label the control around it. */
export const PixelIcon = ({ name, className }: { name: PixelIconName; className?: string }) => {
  const rows = ICONS[name];
  return (
    <svg
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      fill="currentColor"
      aria-hidden
      shapeRendering="crispEdges"
      className={cn("block size-4 shrink-0", className)}
    >
      {cells(rows).map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
      ))}
    </svg>
  );
};

"use client";

import type { MascotDoc } from "openmascot";

import { EMPTY_CELL } from "openmascot";
import { useEffect, useEffectEvent, useState } from "react";

import { REDUCED_MOTION, useMedia } from "@/lib/use-media";

/** A whole pose paints in about this long, however many cells it has. */
const PAINT_MS = 2500;
const CELLS_PER_STEP = 3;
/** Never tick faster than a frame. */
const MIN_STEP_MS = 16;

/**
 * The painted cells of a pose in the order a hand would fill them: row by row, top down,
 * alternating direction like a plough. Each entry is a cell index into the pose string.
 */
export const paintOrder = (doc: MascotDoc, pose: string): number[] => {
  const { w, h } = doc.grid;
  const str = doc.poses[pose] ?? "";
  const order: number[] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      const ch = str[y * w + x];
      if (ch && ch !== EMPTY_CELL) row.push(y * w + x);
    }
    order.push(...(y % 2 ? row.toReversed() : row));
  }
  return order;
};

/**
 * How many cells are painted. While `playing`, counts up from zero on a timer and calls `onDone`
 * once; otherwise (and under reduced motion) the whole pose is there. To paint again, remount.
 */
export const useBoardDraw = (total: number, playing: boolean, onDone?: () => void): number => {
  const reduced = useMedia(REDUCED_MOTION);
  const [count, setCount] = useState(0);
  const done = useEffectEvent(() => onDone?.());
  const animate = playing && !reduced;

  useEffect(() => {
    if (!playing) return;
    if (!animate) return done();
    const stepMs = Math.max(MIN_STEP_MS, (PAINT_MS * CELLS_PER_STEP) / Math.max(1, total));
    let painted = 0;
    const timer = setInterval(() => {
      painted = Math.min(total, painted + CELLS_PER_STEP);
      setCount(painted);
      if (painted < total) return;
      clearInterval(timer);
      done();
    }, stepMs);
    return () => {
      clearInterval(timer);
      setCount(0);
    };
  }, [total, playing, animate]);

  return animate ? count : total;
};

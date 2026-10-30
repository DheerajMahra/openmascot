"use client";

import type { MascotDoc } from "openmascot";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { paintOrder, useBoardDraw } from "./use-board-draw";

export interface BoardCell {
  x: number;
  y: number;
}

interface PixelBoardProps {
  doc: MascotDoc;
  pose?: string;
  /** Accessible name for the board. */
  label: string;
  /** Paint the pose cell by cell. At rest the board shows the finished pose. Remount to repaint. */
  playing?: boolean;
  /** After every paint step: cells painted, cells in total, and the cell just painted. */
  onProgress?: (drawn: number, total: number, cell: BoardCell | null) => void;
  onDone?: () => void;
  className?: string;
}

/** Reads a color token so the canvas follows globals.css. */
const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/**
 * The studio's drawing board in miniature: grid lines, the center guides, and a pose painted
 * cell by cell. The canvas takes its width from the parent and stays 3:2, the shape of a
 * 24 × 16 grid.
 */
export const PixelBoard = ({
  doc,
  pose = "default",
  label,
  playing = false,
  onProgress,
  onDone,
  className
}: PixelBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const order = useMemo(() => paintOrder(doc, pose), [doc, pose]);
  const drawn = useBoardDraw(order.length, playing, onDone);
  const progress = useEffectEvent(() => {
    const last = order[Math.min(drawn, order.length) - 1];
    const cell =
      last === undefined ? null : { x: last % doc.grid.w, y: Math.floor(last / doc.grid.w) };
    onProgress?.(drawn, order.length, cell);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setBox({ width, height });
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !box.width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    const { w, h } = doc.grid;
    const cw = canvas.width / w;
    const ch = canvas.height / h;
    const str = doc.poses[pose] ?? "";

    ctx.fillStyle = token(canvas, "--color-board");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const i of order.slice(0, drawn)) {
      const color = doc.palette[parseInt(str[i] ?? "", 36)];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round((i % w) * cw),
        Math.round(Math.floor(i / w) * ch),
        Math.ceil(cw),
        Math.ceil(ch)
      );
    }
    ctx.fillStyle = token(canvas, "--color-board-grid");
    for (let x = 1; x < w; x++) ctx.fillRect(Math.round(x * cw), 0, 1, canvas.height);
    for (let y = 1; y < h; y++) ctx.fillRect(0, Math.round(y * ch), canvas.width, 1);
    // The mirror guides through the middle, as in the studio.
    ctx.fillStyle = token(canvas, "--color-clay");
    ctx.globalAlpha = 0.55;
    ctx.fillRect(Math.round((w / 2) * cw) - 1, 0, 2, canvas.height);
    ctx.fillRect(0, Math.round((h / 2) * ch) - 1, canvas.width, 2);
    ctx.globalAlpha = 1;
    progress();
  }, [box, doc, pose, order, drawn]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn("block aspect-3/2 w-full rounded-md", className)}
      />
      <span className="sr-only">{label}</span>
    </>
  );
};

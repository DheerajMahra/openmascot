"use client";

import type { PointerEvent } from "react";

import { EMPTY_CELL } from "@openmascot/embed";
import { useEffect, useRef } from "react";

import { useDeviceSize } from "@/features/make/hooks/use-device-size";
import {
  useBoardOptions,
  useEditorSelection,
  useEditorTool,
  useMascotDispatch,
  useMascotDoc
} from "@/lib/mascot-store";
import { colorChar, normalizePose } from "@/lib/pose-utils";

export const CELL = 20;
const GROUND = "#f6f2ec";
const GRID = "#e3dcd2";
const CENTER = "#a39b90";

/** The drawing surface. Grid always on; center lines are the middle grid lines drawn dotted. */
export const Pixelboard = () => {
  const dispatch = useMascotDispatch();
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();
  const { tool, colorIndex } = useEditorTool();
  const board = useBoardOptions();
  const { w, h } = doc.grid;
  const pose = normalizePose(doc.poses[poseName] ?? "", w, h);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<{ ch: string; mirror: boolean } | null>(null);
  // Draw at exactly the on-screen size so the browser never rescales the canvas:
  // a rescaled canvas drops 1px grid lines and makes them flicker.
  const size = useDeviceSize(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !size) return;
    canvas.width = size.width;
    canvas.height = size.height;
    // Cell edges snapped to whole device pixels, so cells tile without seams and lines stay crisp.
    const px = (x: number) => Math.round((x / w) * size.width);
    const py = (y: number) => Math.round((y / h) * size.height);
    // One CSS pixel, in device pixels.
    const line = Math.max(1, Math.round(size.width / (w * CELL)));
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, size.width, size.height);
    for (let i = 0; i < w * h; i++) {
      const ch = pose[i];
      if (!ch || ch === EMPTY_CELL) continue;
      const x = i % w;
      const y = Math.floor(i / w);
      ctx.fillStyle = doc.palette[parseInt(ch, 36)] ?? "#000";
      ctx.fillRect(px(x), py(y), px(x + 1) - px(x), py(y + 1) - py(y));
    }
    // The outer edge is the wrapper's CSS border, so only the inner lines are drawn.
    ctx.fillStyle = GRID;
    for (let x = 1; x < w; x++) ctx.fillRect(px(x), 0, line, size.height);
    for (let y = 1; y < h; y++) ctx.fillRect(0, py(y), size.width, line);
    if (board.centerLines) {
      // The middle grid lines themselves, redrawn dotted and a little darker.
      const cx = px(w / 2) + line / 2;
      const cy = py(h / 2) + line / 2;
      ctx.strokeStyle = CENTER;
      ctx.lineWidth = line;
      ctx.setLineDash([2 * line, 3 * line]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, size.height);
      ctx.moveTo(0, cy);
      ctx.lineTo(size.width, cy);
      ctx.stroke();
    }
  }, [pose, doc.palette, w, h, board.centerLines, size]);

  const cellAt = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * w);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * h);
    if (x < 0 || y < 0 || x >= w || y >= h) return null;
    return { x, y };
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const cell = cellAt(e);
    if (!cell) return;
    const erase = e.button === 2 || tool === "eraser";
    const ch = erase ? EMPTY_CELL : colorChar(colorIndex);
    if (tool === "fill") {
      dispatch({ type: "fill-cell", pose: poseName, ...cell, ch });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    // Mirror strokes (paint and right-click erase) land on both sides of the center line.
    const mirror = tool === "mirror";
    stroke.current = { ch, mirror };
    dispatch({ type: "paint-cell", pose: poseName, ...cell, ch, commit: true, mirror });
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!stroke.current) return;
    const cell = cellAt(e);
    if (!cell) return;
    const { ch, mirror } = stroke.current;
    dispatch({ type: "paint-cell", pose: poseName, ...cell, ch, commit: false, mirror });
  };

  const onPointerUp = () => {
    stroke.current = null;
  };

  return (
    // The border lives on the wrapper, not the canvas, so it never eats into the drawing.
    <div className="flex max-w-full min-w-0 flex-col gap-2.5" style={{ width: w * CELL + 2 }}>
      <div className="relative border border-stage-text">
        <canvas
          ref={canvasRef}
          aria-label={`Pose canvas, ${w} by ${h} cells, editing pose ${poseName}`}
          className="block w-full cursor-crosshair touch-none"
          style={{ aspectRatio: `${w} / ${h}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={e => e.preventDefault()}
        />
        <span className="absolute right-1 bottom-1.5 rounded-sm bg-white/80 px-1 font-mono text-[10px] text-muted">
          ground
        </span>
      </div>
      <span className="font-mono text-xs text-muted">
        Left click paint · right click erase · drag
      </span>
    </div>
  );
};

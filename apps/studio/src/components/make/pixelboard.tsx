"use client";

import type { PointerEvent } from "react";

import { EMPTY_CELL } from "@openmascot/embed";
import { useEffect, useRef } from "react";

import { useMascot } from "@/lib/mascot-store";
import { colorChar, normalizePose } from "@/lib/pose-utils";

export const CELL = 20;
const GROUND = "#f6f2ec";
const GRID = "#e3dcd2";
const CENTER = "#a39b90";

/** The drawing surface. Grid always on; center lines are the middle grid lines drawn dotted. */
export const Pixelboard = () => {
  const { state, dispatch } = useMascot();
  const { doc, poseName, tool, colorIndex, board } = state;
  const { w, h } = doc.grid;
  const pose = normalizePose(doc.poses[poseName] ?? "", w, h);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stroke = useRef<{ ch: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = GROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < w * h; i++) {
      const ch = pose[i];
      if (!ch || ch === EMPTY_CELL) continue;
      ctx.fillStyle = doc.palette[parseInt(ch, 36)] ?? "#000";
      ctx.fillRect((i % w) * CELL, Math.floor(i / w) * CELL, CELL, CELL);
    }
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, h * CELL);
    }
    for (let y = 0; y <= h; y++) {
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(w * CELL, y * CELL + 0.5);
    }
    ctx.stroke();
    if (board.centerLines) {
      // The middle grid lines themselves, redrawn dotted and a little darker.
      const cx = (w / 2) * CELL + 0.5;
      const cy = (h / 2) * CELL + 0.5;
      ctx.strokeStyle = CENTER;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h * CELL);
      ctx.moveTo(0, cy);
      ctx.lineTo(w * CELL, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [pose, doc.palette, w, h, board.centerLines]);

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
    stroke.current = { ch };
    dispatch({ type: "paint-cell", pose: poseName, ...cell, ch, commit: true });
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!stroke.current) return;
    const cell = cellAt(e);
    if (!cell) return;
    dispatch({ type: "paint-cell", pose: poseName, ...cell, ch: stroke.current.ch, commit: false });
  };

  const onPointerUp = () => {
    stroke.current = null;
  };

  return (
    <div className="flex w-[480px] max-w-full min-w-0 flex-col gap-2.5">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={w * CELL}
          height={h * CELL}
          aria-label={`Pose canvas, ${w} by ${h} cells, editing pose ${poseName}`}
          className={[
            "block max-w-full cursor-crosshair touch-none border border-stage-text",
            board.groundLine ? "border-b-2 border-b-muted" : ""
          ].join(" ")}
          style={{ width: w * CELL, height: "auto", aspectRatio: `${w} / ${h}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onContextMenu={e => e.preventDefault()}
        />
        {board.groundLine && (
          <span className="absolute right-1 bottom-1.5 rounded-sm bg-white/80 px-1 font-mono text-[10px] text-muted">
            ground
          </span>
        )}
      </div>
      <span className="font-mono text-xs text-muted">
        Left click paint · right click erase · drag
      </span>
    </div>
  );
};

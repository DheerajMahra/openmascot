"use client";

import type { MascotDoc } from "openmascot";

import { rasterizePose } from "openmascot";
import { useEffect, useRef } from "react";

interface Props {
  doc: MascotDoc;
  pose?: string;
  /** Rendered width in CSS px. */
  width?: number;
  className?: string;
}

/** A static picture of one pose, drawn to a canvas. Cheap enough to use anywhere a tiny mascot is needed. */
export const MascotThumb = ({ doc, pose = "default", width = 48, className }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { w, h } = doc.grid;
  const height = Math.round((width * h) / w);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(rasterizePose(doc, pose), 0, 0, canvas.width, canvas.height);
  }, [doc, pose]);

  return (
    <canvas
      ref={ref}
      aria-label={`${doc.name} ${pose} pose`}
      width={w * 4}
      height={h * 4}
      style={{ width, height }}
      className={className}
    >
      {doc.name} {pose} pose
    </canvas>
  );
};

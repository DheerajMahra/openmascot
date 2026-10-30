"use client";

import type { MascotDoc } from "openmascot";

import { poseToDataUrl } from "openmascot";
import { useMemo, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

interface PoseImageProps {
  doc: MascotDoc;
  pose: string;
  /** Screen pixels per cell. Fractions are fine; the image is drawn at a whole scale and resized. */
  scale: number;
  /** Decorative by default. */
  alt?: string;
  className?: string;
}

/**
 * One pose as a still image. The PNG needs a canvas, so it is made in the browser; the server
 * render and hydration hold the size with an empty <img>.
 */
const subscribeNever = () => () => {};

export const PoseImage = ({ doc, pose, scale, alt = "", className }: PoseImageProps) => {
  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
  const src = useMemo(
    () => (inBrowser ? poseToDataUrl(doc, pose, Math.max(1, Math.ceil(scale))) : undefined),
    [inBrowser, doc, pose, scale]
  );

  return (
    // A data URL made in the browser; next/image has nothing to optimize here.
    // oxlint-disable-next-line nextjs/no-img-element
    <img
      src={src}
      alt={alt}
      width={doc.grid.w * scale}
      height={doc.grid.h * scale}
      className={cn("block pixelated", className)}
    />
  );
};

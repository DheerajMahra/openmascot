"use client";

import type { CloudField } from "./cloud-field";
import type { RefObject } from "react";

import { useEffect, useRef } from "react";

import { createCloudField } from "./cloud-field";
import { useCardScroll } from "./use-card-scroll";

/**
 * Coloured specks behind the send-off card that drift sideways and slide at different rates as
 * the card scrolls. Under reduced motion they hold still.
 */
export const PixelClouds = ({ cardRef }: { cardRef: RefObject<HTMLElement | null> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const field = useRef<CloudField | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const clouds = createCloudField(canvas);
    field.current = clouds;
    clouds.resize();
    const ro = new ResizeObserver(clouds.resize);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      field.current = null;
    };
  }, []);

  useCardScroll(
    cardRef,
    progress => field.current?.draw(progress),
    () => field.current?.drift()
  );

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 -z-1 size-full" />;
};

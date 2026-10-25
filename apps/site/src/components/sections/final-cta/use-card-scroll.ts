"use client";

import type { RefObject } from "react";

import { useEffect, useEffectEvent } from "react";

import { REDUCED_MOTION } from "@/lib/use-media";

const DRIFT_MS = 90;

/**
 * How far a card has travelled through the viewport: 0 as its top enters at the bottom,
 * 1 as its bottom leaves at the top. Reported on scroll while the card is on screen, and on a
 * slow tick for drifting decorations (not under reduced motion).
 */
export const useCardScroll = (
  ref: RefObject<HTMLElement | null>,
  onScroll: (progress: number) => void,
  onDrift?: () => void
) => {
  const scrolled = useEffectEvent(onScroll);
  const drift = useEffectEvent(() => onDrift?.());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    const progress = () => {
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) return null;
      return (innerHeight - r.top) / (innerHeight + r.height);
    };
    const report = () => {
      const p = progress();
      if (p !== null) scrolled(p);
    };

    let pending = 0;
    const onWindowScroll = () => {
      if (!pending) pending = requestAnimationFrame(() => ((pending = 0), report()));
    };
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > DRIFT_MS && !document.hidden && progress() !== null) {
        last = now;
        drift();
        report();
      }
      frame = requestAnimationFrame(tick);
    };

    report();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onWindowScroll);
      cancelAnimationFrame(pending);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
};

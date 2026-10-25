"use client";

import type { RefObject } from "react";

import { useEffect, useState } from "react";

/** A box counts as in view once it reaches into the middle three fifths of the screen. */
const inView = (r: DOMRect) => r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2;

/**
 * Phones: each scene starts itself the first time its box comes into view, and stays started.
 * Rect checks on every frame and on scroll, so a fast fling or an anchor jump never skips one.
 */
export const useScenesInView = (
  sceneRefs: RefObject<(HTMLElement | null)[]>,
  count: number,
  enabled: boolean
): boolean[] => {
  const [started, setStarted] = useState<boolean[]>(() =>
    Array.from({ length: count }, () => false)
  );

  useEffect(() => {
    if (!enabled) return;
    const seen = Array.from({ length: count }, () => false);
    let frame = 0;
    const check = () => {
      let changed = false;
      sceneRefs.current.forEach((el, i) => {
        if (!el || seen[i] || !inView(el.getBoundingClientRect())) return;
        seen[i] = true;
        changed = true;
      });
      if (changed) setStarted([...seen]);
      return seen.every(Boolean);
    };
    const tick = () => {
      if (!check()) frame = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
    };
  }, [enabled, count, sceneRefs]);

  return started;
};

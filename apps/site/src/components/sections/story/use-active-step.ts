"use client";

import type { RefObject } from "react";

import { useEffect, useEffectEvent } from "react";

interface Span {
  top: number;
  bottom: number;
}

/**
 * The step level with the stage: the one that covers a line through the stage, or failing that
 * the nearest one to it.
 */
const pickStep = (line: number, steps: Span[]): number => {
  let best = 0;
  let bestDistance = Infinity;
  steps.forEach(({ top, bottom }, i) => {
    const distance = top > line ? top - line : bottom < line ? line - bottom : 0;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  return best;
};

/** Where the reference line crosses the stage, from its top: the middle. */
const LINE = 0.5;

/** The stage counts as on screen as soon as any of it shows, so a scene never shows its end first. */
const onScreen = (r: DOMRect) => r.top < innerHeight && r.bottom > 0;

/**
 * Watches which step sits level with the pinned stage, and whether the stage is on screen at all,
 * and reports either when it changes. Scenes play only while the stage is on screen, so the first
 * one doesn't run while the reader is still up in the hero.
 * Rechecked on scroll and on every animation frame, since the stage is sticky and steps move
 * under it without scroll events on some devices (smooth anchor jumps, resizes).
 */
export const useActiveStep = (
  stageRef: RefObject<HTMLElement | null>,
  stepRefs: RefObject<(HTMLElement | null)[]>,
  enabled: boolean,
  onChange: (step: number, stageOnScreen: boolean) => void
) => {
  const report = useEffectEvent(onChange);

  useEffect(() => {
    if (!enabled) return;
    let last = "";
    let frame = 0;
    const check = () => {
      const stage = stageRef.current?.getBoundingClientRect();
      const steps = stepRefs.current.flatMap(el => (el ? [el.getBoundingClientRect()] : []));
      if (!stage || steps.length === 0) return;
      const step = pickStep(stage.top + stage.height * LINE, steps);
      const visible = onScreen(stage);
      const key = `${step}:${visible}`;
      if (key === last) return;
      last = key;
      report(step, visible);
    };
    const tick = () => {
      check();
      frame = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
    };
  }, [enabled, stageRef, stepRefs]);
};

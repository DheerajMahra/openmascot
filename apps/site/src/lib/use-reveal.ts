"use client";

import type { RefObject } from "react";

import { useEffect, useRef, useState } from "react";

import { REDUCED_MOTION } from "@/lib/use-media";

/**
 * "static" is the server render and the reduced-motion state: plainly visible, so the page reads
 * without JavaScript. On mount, anything not yet on screen hides and fades in when it scrolls into view.
 */
export type RevealState = "static" | "hidden" | "shown";

export const useReveal = <T extends Element>(): [RefObject<T | null>, RevealState] => {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia(REDUCED_MOTION).matches) return;
    setState("hidden");
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        setState("shown");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, state];
};

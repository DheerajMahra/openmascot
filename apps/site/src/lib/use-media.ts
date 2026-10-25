"use client";

import { useSyncExternalStore } from "react";

/** The phone layout: one column, nothing sticky, each scene under its own step. */
export const PHONE = "(max-width: 860px)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether a media query matches. False on the server and during hydration, then live. */
export const useMedia = (query: string): boolean =>
  useSyncExternalStore(
    onChange => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );

"use client";

import { useEffect, useRef, useState } from "react";

import { REDUCED_MOTION } from "@/lib/use-media";

export interface Heart {
  id: number;
  /** Viewport point the heart rises from. */
  x: number;
  y: number;
  /** Sideways drift, in px. */
  dx: number;
  /** Stagger, in ms. */
  delay: number;
}

const COUNT = 5;
const LIFETIME = 1200;

/** A burst of hearts at a point, each cleared after its animation. None under reduced motion. */
export const useHearts = (): [Heart[], (x: number, y: number) => void] => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const burst = (x: number, y: number) => {
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    const batch = Array.from({ length: COUNT }, (_, i) => ({
      id: nextId.current++,
      x,
      y,
      dx: Math.round(Math.random() * 60 - 30),
      delay: i * 60
    }));
    setHearts(all => [...all, ...batch]);
    const ids = new Set(batch.map(h => h.id));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setHearts(all => all.filter(h => !ids.has(h.id)));
    }, LIFETIME);
    timers.current.add(timer);
  };

  return [hearts, burst];
};

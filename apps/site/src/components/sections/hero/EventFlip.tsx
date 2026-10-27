"use client";

import { useEffect, useState } from "react";

import { REDUCED_MOTION, useMedia } from "@/lib/use-media";
import { cn } from "@/lib/utils";

const EVENTS = [
  { word: "hovers", dot: "bg-orange" },
  { word: "clicks", dot: "bg-moss" },
  { word: "signups", dot: "bg-gold" },
  { word: "errors", dot: "bg-lilac" },
  { word: "events", dot: "bg-blue" }
];

const EVERY_MS = 2200;

/**
 * An inline pill whose word slides up to the next kind of event. Screen readers get the whole
 * list once; under reduced motion the first word stays put.
 */
export const EventFlip = () => {
  const reduced = useMedia(REDUCED_MOTION);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex(i => (i + 1) % EVENTS.length);
    }, EVERY_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  const shown = reduced ? 0 : index;
  const previous = (shown + EVENTS.length - 1) % EVENTS.length;

  return (
    <>
      <span className="sr-only">hovers, clicks, signups, errors and events.</span>
      <span
        aria-hidden
        className="inline-grid h-8.5 overflow-hidden rounded-full border border-hairline bg-paper px-3 align-middle font-mono text-sm text-ink shadow-float"
      >
        {EVENTS.map(({ word, dot }, i) => (
          <span
            key={word}
            className={cn(
              "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
              "transition-[translate,opacity] duration-450 ease-spring motion-reduce:transition-none",
              i === shown && "translate-y-0 opacity-100",
              i === previous && i !== shown && "-translate-y-full opacity-0",
              i !== shown && i !== previous && "translate-y-full opacity-0"
            )}
          >
            <i className={cn("block size-2 rounded-xs", dot)} />
            {word}
          </span>
        ))}
      </span>
    </>
  );
};

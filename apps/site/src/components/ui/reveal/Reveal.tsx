"use client";

import type { HTMLAttributes } from "react";

import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/utils";

const DELAYS = ["delay-0", "delay-90", "delay-180"] as const;

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Position in a row of reveals; each step waits a little longer. */
  order?: 0 | 1 | 2;
  /** Grow in slightly as well as rise. For cards. */
  pop?: boolean;
}

/** Fades its content up the first time it scrolls into view. Visible without JavaScript. */
export const Reveal = ({ order = 0, pop, className, ...rest }: RevealProps) => {
  const [ref, state] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-reveal={state}
      className={cn(
        state !== "static" &&
          "transition-[opacity,translate,scale] duration-700 ease-spring " + DELAYS[order],
        state === "hidden" && "translate-y-7 opacity-0",
        state === "hidden" && pop && "translate-y-5 scale-96",
        className
      )}
      {...rest}
    />
  );
};

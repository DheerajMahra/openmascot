"use client";

import type { ReactNode, RefObject } from "react";

import { useRef } from "react";

import { Chip, ChipCall, ChipMove } from "@/components/ui/chip/Chip";
import { PHONE, REDUCED_MOTION } from "@/lib/use-media";
import { cn } from "@/lib/utils";

import { useCardScroll } from "./use-card-scroll";

const PILLS: { text: ReactNode; speed: number; className: string }[] = [
  {
    text: (
      <>
        &quot;hover&quot; → <ChipMove>sway</ChipMove>
      </>
    ),
    speed: 0.12,
    className: "bottom-24 left-1/25 -rotate-6 md:bottom-28 xl:bottom-3/10 xl:-rotate-8"
  },
  {
    text: (
      <>
        &quot;interval:6&quot; → <ChipMove>idle</ChipMove>
      </>
    ),
    speed: -0.08,
    className: "bottom-7/100 left-1/10 hidden rotate-4 xl:inline-flex"
  },
  {
    text: (
      <>
        <ChipCall>Mascot.emit</ChipCall>(&quot;success&quot;)
      </>
    ),
    speed: 0.1,
    className: "right-2/25 bottom-7/100 hidden -rotate-5 xl:inline-flex"
  },
  {
    text: (
      <>
        &quot;click&quot; → <ChipMove>celebrate</ChipMove>
      </>
    ),
    speed: -0.14,
    className: "right-1/25 bottom-20 rotate-5 md:bottom-24 xl:bottom-8/25 xl:rotate-7"
  },
  {
    text: <>data-position=&quot;bottom-right&quot;</>,
    speed: 0.06,
    className: "top-2/25 right-3/50 hidden rotate-3 xl:inline-flex"
  }
];

/** How far, in px, a pill drifts over the card's whole pass through the screen, per unit speed. */
const TRAVEL = 300;

/** Trigger stickers scattered over the send-off card, drifting at different speeds as it scrolls. */
export const FloatingPills = ({ cardRef }: { cardRef: RefObject<HTMLElement | null> }) => {
  const pills = useRef<(HTMLElement | null)[]>([]);

  useCardScroll(cardRef, progress => {
    const still = matchMedia(REDUCED_MOTION).matches || matchMedia(PHONE).matches;
    PILLS.forEach(({ speed }, i) => {
      const y = still ? 0 : (progress - 0.5) * TRAVEL * speed;
      pills.current[i]?.style.setProperty("--py", `${y.toFixed(1)}px`);
    });
  });

  return PILLS.map((pill, i) => (
    <Chip
      key={i}
      ref={el => {
        pills.current[i] = el;
      }}
      className={cn(
        "absolute z-1 translate-y-(--py) px-2 py-1 text-tag shadow-ink-sm md:px-3 md:py-2 md:text-xs md:shadow-ink-md xl:px-4 xl:py-2.5 xl:text-caption",
        pill.className
      )}
    >
      {pill.text}
    </Chip>
  ));
};

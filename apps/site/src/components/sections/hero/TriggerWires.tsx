"use client";

import type { ReactNode, RefObject } from "react";

import { useLayoutEffect, useRef, useState } from "react";

import { Chip, ChipCall, ChipMove } from "@/components/ui/chip/Chip";
import { useMedia } from "@/lib/use-media";
import { cn } from "@/lib/utils";

export type HeroMascot = "moss" | "clawd";

/** What a chip does when pressed: play a move, or emit a custom event, on one of the two mascots. */
export type HeroTrigger = { who: HeroMascot } & ({ play: string } | { emit: string });

/** Where a mascot's drawn pixels sit inside its element, in px, so wires meet the sprite itself. */
export interface SpriteBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A mascot the wires run to: its element and the sprite's box inside it. */
export interface WireTarget {
  el: RefObject<HTMLElement | null>;
  box: SpriteBox;
}

/** Moss sits on the left, so the left chips are his; the right ones are Clawd's. */
const CHIPS: { trigger: HeroTrigger; label: string; className: string; text: ReactNode }[] = [
  {
    trigger: { who: "moss", play: "hop" },
    label: "Play hop, Moss's hover move",
    className: "top-0 left-0 -rotate-3 lg:top-10 lg:left-9/50 lg:-rotate-6",
    text: (
      <>
        &quot;hover&quot; → <ChipMove>hop</ChipMove>
      </>
    )
  },
  {
    trigger: { who: "clawd", play: "celebrate" },
    label: "Play celebrate, Clawd's click move",
    className: "top-11 right-0 rotate-3 lg:top-7.5 lg:right-9/50 lg:rotate-5",
    text: (
      <>
        &quot;click&quot; → <ChipMove>celebrate</ChipMove>
      </>
    )
  },
  {
    trigger: { who: "moss", play: "wobble" },
    label: "Play wobble, the move Moss's timer plays in the studio",
    className: "top-11 left-0 rotate-2 lg:top-auto lg:bottom-8.5 lg:left-7/50 lg:rotate-3",
    text: (
      <>
        &quot;interval:6&quot; → <ChipMove>wobble</ChipMove>
      </>
    )
  },
  {
    trigger: { who: "clawd", emit: "success" },
    label: "Send Clawd a success event",
    className: "top-0 right-0 -rotate-2 lg:top-auto lg:right-7/50 lg:bottom-10 lg:-rotate-4",
    text: (
      <>
        <ChipCall>Mascot.emit</ChipCall>(&quot;success&quot;)
      </>
    )
  }
];

/** The site's `lg` (globals.css), where the chips fan out on either side instead of stacking above. */
const WIDE = "(min-width: 53.75rem)";

/**
 * One wire from a chip to its mascot's sprite, in the container's px. Wide screens run it from
 * the chip's inner side to the sprite's outer side, upper chips higher up the body. Phones drop
 * it onto the sprite's top: the upper chip leaves from its inner side and bends down near the
 * gap, the lower one leaves from its bottom.
 */
const wirePath = (chip: DOMRect, sprite: DOMRect, left: boolean, upper: boolean, wide: boolean) => {
  if (wide) {
    const sx = left ? chip.right : chip.left;
    const sy = chip.top + chip.height / 2;
    const ex = left ? sprite.left : sprite.right;
    const ey = sprite.top + sprite.height * (upper ? 0.3 : 0.7);
    const mx = (sx + ex) / 2;
    return `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`;
  }
  const ey = sprite.top;
  if (upper) {
    const sx = left ? chip.right : chip.left;
    const sy = chip.top + chip.height / 2;
    const ex = sprite.left + sprite.width * (left ? 0.8 : 0.2);
    return `M ${sx} ${sy} C ${ex} ${sy}, ${ex} ${sy}, ${ex} ${ey}`;
  }
  const sx = chip.left + chip.width / 2;
  const sy = chip.bottom;
  const ex = sprite.left + sprite.width * (left ? 0.4 : 0.6);
  const my = (sy + ey) / 2;
  return `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`;
};

/**
 * Four trigger chips wired to the two mascots. Each chip is a button that fires its trigger, so
 * the chips double as a demo. The wires are measured from the real chips and sprites, so they
 * meet both ends at any width.
 */
export const TriggerWires = ({
  targets,
  onFire
}: {
  targets: Record<HeroMascot, WireTarget>;
  onFire: (trigger: HeroTrigger) => void;
}) => {
  const wide = useMedia(WIDE);
  const rootRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const origin = root.getBoundingClientRect();
      const local = (r: DOMRect) =>
        new DOMRect(r.left - origin.left, r.top - origin.top, r.width, r.height);
      const chips = chipRefs.current.map(el => (el ? local(el.getBoundingClientRect()) : null));

      setPaths(
        CHIPS.flatMap((chip, i) => {
          const rect = chips[i];
          const { el, box } = targets[chip.trigger.who];
          if (!rect || !el.current) return [];
          const host = local(el.current.getBoundingClientRect());
          const sprite = new DOMRect(host.x + box.left, host.y + box.top, box.width, box.height);
          // The upper chip of the pair sharing this mascot.
          const upper = CHIPS.every(
            (other, j) => other.trigger.who !== chip.trigger.who || (chips[j]?.top ?? 0) >= rect.top
          );
          return [wirePath(rect, sprite, chip.trigger.who === "moss", upper, wide)];
        })
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    for (const { el } of Object.values(targets)) if (el.current) ro.observe(el.current);
    return () => ro.disconnect();
  }, [targets, wide]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 lg:top-auto lg:bottom-12 lg:h-62.5"
    >
      <svg
        aria-hidden
        className="absolute inset-0 size-full overflow-visible fill-none stroke-line"
      >
        {paths.map(d => (
          <path key={d} d={d} strokeWidth="2" strokeDasharray="4 5" />
        ))}
      </svg>
      {CHIPS.map((chip, i) => (
        <button
          key={chip.label}
          ref={el => {
            chipRefs.current[i] = el;
          }}
          type="button"
          aria-label={chip.label}
          onClick={() => onFire(chip.trigger)}
          className={cn(
            "pointer-events-auto absolute cursor-pointer rounded-full transition-[translate] duration-150 hover:-translate-y-0.5 motion-reduce:transition-none",
            chip.className
          )}
        >
          <Chip className="px-2 py-1 text-tag lg:px-3 lg:py-1.5 lg:text-code">{chip.text}</Chip>
        </button>
      ))}
    </div>
  );
};

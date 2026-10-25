import type { ReactNode } from "react";

import { Chip, ChipCall, ChipMove } from "@/components/ui/chip/Chip";
import { cn } from "@/lib/utils";

/** What a chip does to Clawd when pressed: play a move, or emit a custom event. */
export type HeroTrigger = { play: string } | { emit: string };

const CHIPS: { trigger: HeroTrigger; label: string; className: string; text: ReactNode }[] = [
  {
    trigger: { play: "sway" },
    label: "Play sway, Clawd's hover move",
    className: "top-0 left-0 -rotate-3 lg:top-10 lg:left-9/50 lg:-rotate-6",
    text: (
      <>
        &quot;hover&quot; → <ChipMove>sway</ChipMove>
      </>
    )
  },
  {
    trigger: { play: "celebrate" },
    label: "Play celebrate, Clawd's click move",
    className: "top-11 right-0 rotate-3 lg:top-7.5 lg:right-9/50 lg:rotate-5",
    text: (
      <>
        &quot;click&quot; → <ChipMove>celebrate</ChipMove>
      </>
    )
  },
  {
    trigger: { play: "idle" },
    label: "Play idle, the move Clawd's timer plays in the studio",
    className: "top-11 left-0 rotate-2 lg:top-auto lg:bottom-8.5 lg:left-7/50 lg:rotate-3",
    text: (
      <>
        &quot;interval:6&quot; → <ChipMove>idle</ChipMove>
      </>
    )
  },
  {
    trigger: { emit: "success" },
    label: "Send Clawd a success event",
    className: "top-0 right-0 -rotate-2 lg:top-auto lg:right-7/50 lg:bottom-10 lg:-rotate-4",
    text: (
      <>
        <ChipCall>Mascot.emit</ChipCall>(&quot;success&quot;)
      </>
    )
  }
];

/**
 * Dashed wires from each chip to Clawd at the bottom middle. Phones stack the chips in two rows
 * above him (hover and emit on top, then interval and click); wide screens fan them out on
 * either side. Each wire starts under its chip, so it meets the chip at any width.
 */
const PHONE_WIRES = [
  "M 34 6 C 42 14, 45 40, 47 60",
  "M 66 6 C 58 14, 55 40, 53 60",
  "M 34 26 C 40 30, 44 46, 46 60",
  "M 66 26 C 60 30, 56 46, 54 60"
];

const WIDE_WIRES = [
  "M 210 55 C 350 75, 430 150, 480 190",
  "M 790 45 C 650 75, 570 150, 520 190",
  "M 170 201 C 300 203, 400 210, 470 215",
  "M 830 195 C 700 200, 600 210, 530 215"
];

const Wires = ({
  paths,
  viewBox,
  className
}: {
  paths: string[];
  viewBox: string;
  className: string;
}) => (
  <svg
    aria-hidden
    viewBox={viewBox}
    preserveAspectRatio="none"
    className={cn("absolute inset-0 size-full fill-none stroke-line", className)}
  >
    {paths.map(d => (
      <path key={d} d={d} strokeWidth="2" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
    ))}
  </svg>
);

/**
 * Four trigger chips wired to the mascot. Each chip is a button that fires its trigger, so the
 * chips double as a demo.
 */
export const TriggerWires = ({ onFire }: { onFire: (trigger: HeroTrigger) => void }) => (
  <div className="pointer-events-none absolute inset-0 lg:top-auto lg:bottom-12 lg:h-62.5">
    <Wires paths={PHONE_WIRES} viewBox="0 0 100 100" className="lg:hidden" />
    <Wires paths={WIDE_WIRES} viewBox="0 0 1000 250" className="hidden lg:block" />
    {CHIPS.map(chip => (
      <button
        key={chip.label}
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

import type { RefObject } from "react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    label: "Step 1 · Make",
    title: "Draw your character on a 24 × 16 board.",
    body: "Start from Clawd, Moss or a blank canvas. Paint with the pencil, drag for a run of cells, and let the mirror pencil draw the other half. Fill paints a whole area; right click erases. Every pose is a small edit of default.",
    notes: ["Live preview as you draw", "Mirror pencil for symmetry", "Autosaves in your browser"],
    order: "order-1",
    accent: { text: "text-clay-text", bar: "before:bg-clay" }
  },
  {
    label: "Step 2 · Animate",
    title: "Give it moves, then say when they play.",
    body: "A move is a few poses shown one after another, like a flipbook: each row holds a pose for some frames, and can push it down or slide it sideways. Start from Bounce or Sway, start empty, or duplicate a move. Then pick what sets each one off: a hover, a click, page load, a timer, or an event from your own code.",
    notes: ["sway · on hover", "idle · every 6 s", 'celebrate · on "success"'],
    order: "order-3",
    accent: { text: "text-moss-text", bar: "before:bg-moss" }
  },
  {
    label: "Step 3 · Share",
    title: "Download one file. Paste two lines.",
    body: "The mascot is one JSON file with its poses, moves and triggers. Drop it next to embed.js and paste the two lines the studio gives you. A GIF of a move and a PNG of a pose download from the same screen.",
    notes: ["Works on any website", "No build step", "No backend, no account"],
    order: "order-5",
    accent: { text: "text-gold-text", bar: "before:bg-gold" }
  }
];

export const STEP_COUNT = STEPS.length;

interface StoryStepsProps {
  /** The step level with the stage; the others dim. Null on phones, where all are lit. */
  active: number | null;
  stepRefs: RefObject<(HTMLElement | null)[]>;
}

/**
 * The three steps of the story. On desktop each is as tall as the stage and starts at its top,
 * so a step's label sits level with the stage's top edge while that step is on.
 */
export const StorySteps = ({ active, stepRefs }: StoryStepsProps) => (
  <ol className="contents lg:flex lg:flex-col lg:gap-step-gap">
    {STEPS.map((step, i) => (
      <li
        key={step.label}
        ref={el => {
          stepRefs.current[i] = el;
        }}
        aria-current={active === i ? "step" : undefined}
        className={cn(
          step.order,
          "flex flex-col justify-center gap-4 pt-5 pb-4 lg:order-none lg:min-h-(--stage-h) lg:justify-start lg:py-0",
          "transition-opacity duration-500 motion-reduce:transition-none",
          active !== null && active !== i && "lg:opacity-35"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-2.5 font-mono text-label font-medium tracking-label uppercase",
            "before:block before:h-0.5 before:w-7",
            step.accent.text,
            step.accent.bar
          )}
        >
          {step.label}
        </span>
        <h3 className="text-step leading-display font-bold tracking-tight">{step.title}</h3>
        <p className="max-w-step text-lg text-muted">{step.body}</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {step.notes.map(note => (
            <li
              key={note}
              className="rounded-full border border-hairline bg-paper-2 px-2.5 py-1.25 font-mono text-code text-ink-soft"
            >
              {note}
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ol>
);

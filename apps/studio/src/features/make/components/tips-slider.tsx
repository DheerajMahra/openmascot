"use client";

import { useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const TIPS = [
  "Start where the center lines cross and grow outward. Keep the feet on the ground line.",
  "Eyes two cells wide with a gap between them read best at this size. Big eyes, small mouth.",
  "Right click erases. Drag to paint a run of cells. Fill paints a whole connected area.",
  "Poses are small edits of default: move the eyes a cell, raise the arms. Add one from the Poses list."
];

export const TipsSlider = () => {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex(i => (i - 1 + TIPS.length) % TIPS.length);
  const next = () => setIndex(i => (i + 1) % TIPS.length);

  return (
    <section aria-label="Tips" className="flex w-[480px] max-w-full flex-col gap-2">
      <div className="flex min-h-[58px] items-start gap-2.5 rounded-lg border border-dashed border-clay bg-clay-tint px-3 py-2.5 text-[13px] text-ink-soft">
        <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-clay" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-clay-deep">
            Tip {index + 1} of {TIPS.length}
          </span>
          <span aria-live="polite" className="leading-snug">
            {TIPS[index]}
          </span>
        </span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <IconButton
          label="Previous tip"
          variant="muted"
          onClick={prev}
          className="h-6.5 w-6.5 rounded-full"
        >
          <ChevronLeftIcon width={12} height={12} />
        </IconButton>
        <span aria-hidden="true" className="flex items-center gap-1.5">
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={cn("h-1.5 w-1.5 rounded-full", i === index ? "bg-clay" : "bg-line")}
            />
          ))}
        </span>
        <IconButton
          label="Next tip"
          variant="muted"
          onClick={next}
          className="h-6.5 w-6.5 rounded-full"
        >
          <ChevronRightIcon width={12} height={12} />
        </IconButton>
      </div>
    </section>
  );
};

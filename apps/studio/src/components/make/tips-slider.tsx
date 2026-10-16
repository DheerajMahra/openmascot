"use client";

import { useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const TIPS = [
  "Start where the center lines cross and grow outward. Keep the feet on the ground line.",
  "Eyes two cells wide with a gap between them read best at this size. Big eyes, small mouth.",
  "Right click erases. Drag to paint a run of cells. Fill paints a whole connected area.",
  "Poses are small edits of default: move the eyes a cell, raise the arms. Add one from the Poses list."
];

const arrowClass =
  "flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-full border border-line bg-paper p-0 text-muted hover:border-clay";

export const TipsSlider = () => {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex(i => (i - 1 + TIPS.length) % TIPS.length);
  const next = () => setIndex(i => (i + 1) % TIPS.length);

  return (
    <div aria-label="Tips" className="flex w-[480px] max-w-full flex-col gap-2">
      <div className="flex min-h-[58px] items-start gap-2.5 rounded-lg border border-dashed border-clay bg-clay-tint px-3 py-2.5 text-[13px] text-[#3d3833]">
        <span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-clay" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-clay-deep">
            Tip {index + 1} of {TIPS.length}
          </span>
          <span className="leading-snug">{TIPS[index]}</span>
        </span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button type="button" aria-label="Previous tip" onClick={prev} className={arrowClass}>
          <ChevronLeftIcon width={12} height={12} />
        </button>
        <span aria-hidden="true" className="flex items-center gap-1.5">
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-clay" : "bg-line"}`}
            />
          ))}
        </span>
        <button type="button" aria-label="Next tip" onClick={next} className={arrowClass}>
          <ChevronRightIcon width={12} height={12} />
        </button>
      </div>
    </div>
  );
};

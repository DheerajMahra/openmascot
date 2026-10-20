"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CheckIcon } from "@/components/ui/icons";
import { STEPS, stepIndex } from "@/lib/steps";
import { cn } from "@/lib/utils";

type StepState = "done" | "current" | "todo";

const StepBadge = ({ state, number }: { state: StepState; number: number }) => (
  <span
    className={cn(
      "flex h-6.5 w-6.5 items-center justify-center rounded-full text-[13px] font-semibold",
      state === "current" && "bg-clay text-white",
      state === "done" && "bg-ink text-white",
      state === "todo" && "border border-stage-text text-muted"
    )}
  >
    {state === "done" ? <CheckIcon width={12} height={12} /> : number}
  </span>
);

/** Centered three-step bar under the header. Earlier steps show a tick. */
export const Stepper = () => {
  const current = stepIndex(usePathname());
  return (
    <nav
      aria-label="Steps"
      className="flex h-13 items-center justify-center border-b border-line bg-paper-2 px-6"
    >
      <ol className="m-0 flex list-none items-center p-0">
        {STEPS.map((step, i) => {
          const state: StepState = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={step.href} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="mx-7 h-px w-10 bg-line" />}
              <Link
                href={step.href}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2.5 no-underline",
                  state === "current" ? "text-ink" : "text-muted"
                )}
              >
                <StepBadge state={state} number={i + 1} />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="text-xs">{step.blurb}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

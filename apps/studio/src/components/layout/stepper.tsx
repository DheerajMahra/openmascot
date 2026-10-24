"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    {state === "done" ? <CheckIcon size={12} strokeWidth={3} /> : number}
  </span>
);

/**
 * Centered three-step bar atop the workspace column. Earlier steps show a tick.
 * When the column gets narrow, the blurbs hide and the connectors shorten so the steps still fit.
 */
export const Stepper = () => {
  const current = stepIndex(usePathname());
  return (
    <nav
      aria-label="Steps"
      className="@container flex h-13 shrink-0 items-center justify-center border-b border-line bg-paper-2 px-6"
    >
      <ol className="m-0 flex list-none items-center p-0">
        {STEPS.map((step, i) => {
          const state: StepState = i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={step.href} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-7 h-px w-10 bg-line @max-2xl:mx-3 @max-2xl:w-6"
                />
              )}
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
                  <span className="text-xs @max-2xl:hidden">{step.blurb}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CheckIcon } from "@/components/icons";

export const STEPS = [
  { href: "/make", label: "Make", blurb: "Draw your character" },
  { href: "/animate", label: "Animate", blurb: "Give it moves" },
  { href: "/share", label: "Share", blurb: "Take it with you" }
] as const;

export const stepIndex = (pathname: string): number =>
  Math.max(
    0,
    STEPS.findIndex(s => pathname.startsWith(s.href))
  );

/** Centered three-step bar under the header. Earlier steps show a tick. */
export const Stepper = () => {
  const current = stepIndex(usePathname());
  return (
    <nav
      aria-label="Steps"
      className="flex h-13 items-center justify-center border-b border-line bg-paper-2 px-6"
    >
      {STEPS.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <span key={step.href} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="mx-7 h-px w-10 bg-line" />}
            <Link
              href={step.href}
              aria-current={state === "current" ? "step" : undefined}
              className={`flex items-center gap-2.5 no-underline ${state === "current" ? "text-ink" : "text-muted"}`}
            >
              <span
                className={[
                  "flex h-6.5 w-6.5 items-center justify-center rounded-full text-[13px] font-semibold",
                  state === "current" && "bg-clay text-white",
                  state === "done" && "bg-ink text-white",
                  state === "todo" && "border border-stage-text text-muted"
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {state === "done" ? <CheckIcon width={12} height={12} /> : i + 1}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">{step.label}</span>
                <span className="text-xs">{step.blurb}</span>
              </span>
            </Link>
          </span>
        );
      })}
    </nav>
  );
};

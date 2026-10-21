/** The three editor steps, in order. Drives the stepper and the "Next" links. */
export const STEPS = [
  { href: "/make", label: "Make", blurb: "Draw your character" },
  { href: "/animate", label: "Animate", blurb: "Give it moves" },
  { href: "/share", label: "Share", blurb: "Take it with you" }
] as const;

export type Step = (typeof STEPS)[number];

export const stepIndex = (pathname: string): number =>
  Math.max(
    0,
    STEPS.findIndex(s => pathname.startsWith(s.href))
  );

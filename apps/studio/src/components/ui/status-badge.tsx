import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TONES = {
  success: { text: "text-success", dot: "bg-success-dot" },
  warning: { text: "text-warning", dot: "bg-warning-dot" }
} as const;

/** A dot plus a short status line. The text carries the meaning; color only reinforces it. */
export const StatusBadge = ({
  tone,
  children,
  className
}: {
  tone: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) => (
  <span className={cn("inline-flex items-center gap-1.5 text-xs", TONES[tone].text, className)}>
    <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", TONES[tone].dot)} />
    {children}
  </span>
);

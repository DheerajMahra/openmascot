import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Small uppercase monospace label that names a section or column. */
export const SectionLabel = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "flex h-7 items-center gap-1.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase",
      className
    )}
    {...rest}
  />
);

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** A comic speech bubble with an ink outline, offset shadow and a tail at the bottom left. */
export const SpeechBubble = ({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative rounded-tile border-2 border-ink bg-paper px-7 py-4.5 shadow-ink-lg",
      className
    )}
    {...rest}
  >
    {children}
    <span
      aria-hidden
      className="absolute -bottom-0.5 left-7.5 size-4.5 translate-y-1/2 rotate-45 border-r-2 border-b-2 border-ink bg-paper"
    />
  </div>
);

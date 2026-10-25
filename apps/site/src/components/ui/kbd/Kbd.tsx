import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** A keyboard shortcut, drawn as a small keycap: <Kbd>⌘Z</Kbd>. */
export const Kbd = ({ className, ...rest }: HTMLAttributes<HTMLElement>) => (
  <kbd
    className={cn(
      "inline-flex items-center rounded-sm border border-line bg-paper-2 px-1.5 align-baseline font-mono text-code leading-normal text-ink-soft shadow-kbd",
      className
    )}
    {...rest}
  />
);

import type { ComponentProps, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Ink-bordered sticker with a hard offset shadow, for code-ish labels like `"click" → celebrate`.
 * Rotate and place it from the outside.
 */
export const Chip = ({ className, ...rest }: ComponentProps<"span">) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border-2 border-ink bg-paper px-3 py-1.5",
      "font-mono text-code whitespace-nowrap text-ink shadow-ink-sm",
      className
    )}
    {...rest}
  />
);

/** The move name inside a chip. */
export const ChipMove = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-moss-text", className)} {...rest} />
);

/** A call into the page API inside a chip, like `Mascot.emit`. */
export const ChipCall = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-gold-text", className)} {...rest} />
);

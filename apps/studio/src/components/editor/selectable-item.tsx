import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SelectableItemProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean };

/**
 * A row in a sidebar list (poses, moves) that can be the current one.
 * The selected ring is an inset shadow so the row doesn't shift by a pixel.
 */
export const SelectableItem = ({ selected, className, ...rest }: SelectableItemProps) => (
  <button
    type="button"
    aria-pressed={selected}
    className={cn(
      "flex cursor-pointer items-center gap-2.5 rounded-lg border text-left text-ink transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      selected
        ? "border-clay bg-clay-tint shadow-[inset_0_0_0_1px_var(--color-clay)]"
        : "border-line bg-paper hover:border-clay",
      className
    )}
    {...rest}
  />
);

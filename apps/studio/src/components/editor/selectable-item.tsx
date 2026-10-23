import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type SelectableItemProps = ComponentProps<"button"> & { selected: boolean };

/**
 * A ref for the selected row only: React calls it each time the selection moves to another row,
 * so a list keeps its selected item in sight: a new pose or move lands at the bottom of a long list,
 * and undo can switch to a pose that is scrolled away. Rows already in view don't move.
 */
export const scrollIntoView = (row: HTMLButtonElement | null) =>
  row?.scrollIntoView({ block: "nearest", behavior: "smooth" });

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

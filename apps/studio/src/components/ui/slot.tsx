import type { HTMLAttributes, MouseEvent } from "react";

import { cloneElement, isValidElement } from "react";

import { cn } from "@/lib/utils";

type SlotProps = HTMLAttributes<HTMLElement>;

/**
 * Renders its only child with these props merged in, so a primitive can lend its styling
 * and behavior to another element (`<Button asChild><Link /></Button>`).
 * The child's own props win, classes are merged, and both click handlers run.
 */
export const Slot = ({ children, className, onClick, ...props }: SlotProps) => {
  if (!isValidElement<SlotProps>(children)) return null;
  const own = children.props;
  return cloneElement(children, {
    ...props,
    ...own,
    className: cn(className, own.className),
    onClick: (e: MouseEvent<HTMLElement>) => {
      own.onClick?.(e);
      if (!e.defaultPrevented) onClick?.(e);
    }
  });
};

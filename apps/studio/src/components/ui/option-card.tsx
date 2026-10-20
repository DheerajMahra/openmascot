import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type OptionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

/** A bordered, clickable choice with a title and a line of description. */
export const OptionCard = ({ asChild, className, type, ...rest }: OptionCardProps) => {
  const classes = cn(
    "flex cursor-pointer flex-col items-start gap-1 rounded-lg border border-line bg-paper p-3 text-left hover:border-clay",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
    className
  );
  return asChild ? (
    <Slot className={classes} {...rest} />
  ) : (
    <button type={type ?? "button"} className={classes} {...rest} />
  );
};

export const OptionCardTitle = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-mono text-[13px] font-semibold", className)} {...rest} />
);

export const OptionCardDescription = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-xs text-muted", className)} {...rest} />
);

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cva } from "class-variance-authority";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  [
    "flex shrink-0 cursor-pointer items-center justify-center rounded-md border p-0 transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
    "disabled:cursor-not-allowed disabled:text-stage-text"
  ],
  {
    variants: {
      variant: {
        outline: "border-line bg-paper text-ink hover:border-clay",
        muted: "border-line bg-paper text-muted hover:border-clay",
        ghost: "border-transparent bg-transparent text-muted hover:border-line"
      },
      size: {
        lg: "h-10 w-10",
        md: "h-7 w-7",
        sm: "h-6 w-6"
      },
      active: {
        true: "border-ink bg-ink text-white hover:border-ink",
        false: ""
      }
    },
    defaultVariants: { variant: "outline", size: "lg", active: false }
  }
);

export type IconButtonProps = ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & {
    /** Accessible name, and the tooltip's text when there is one. */
    label: string;
    /** Set for toggle buttons; leaves aria-pressed off for plain actions. */
    active?: boolean;
    /** Show the label in a styled tooltip on this side. Without it there is no tooltip, native or otherwise. */
    tooltip?: "top" | "right" | "bottom" | "left";
  };

/** A square button holding only an icon. */
export const IconButton = ({
  label,
  active,
  tooltip,
  variant,
  size,
  className,
  ...rest
}: IconButtonProps) => {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className={cn(
        iconButtonVariants({ variant, size, active: active ?? false }),
        // A disabled button gets no pointer events, so the wrapper below takes the hover instead.
        tooltip && "disabled:pointer-events-none",
        className
      )}
      {...rest}
    />
  );
  if (!tooltip) return button;
  return (
    // Keyed so the tooltip starts fresh when its trigger switches between the wrapper and the button.
    <Tooltip key={rest.disabled ? "disabled" : "enabled"}>
      {/* Disabled buttons often carry the reason in their label, so hover a wrapper to still show it. */}
      {rest.disabled ? (
        <TooltipTrigger render={<span className="inline-flex cursor-not-allowed" />}>
          {button}
        </TooltipTrigger>
      ) : (
        <TooltipTrigger render={button} />
      )}
      <TooltipContent side={tooltip}>{label}</TooltipContent>
    </Tooltip>
  );
};

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cva } from "class-variance-authority";

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
    /** Accessible name, also shown as the tooltip. */
    label: string;
    /** Set for toggle buttons; leaves aria-pressed off for plain actions. */
    active?: boolean;
  };

/** A square button holding only an icon. */
export const IconButton = ({
  label,
  active,
  variant,
  size,
  className,
  ...rest
}: IconButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={cn(iconButtonVariants({ variant, size, active: active ?? false }), className)}
    {...rest}
  />
);

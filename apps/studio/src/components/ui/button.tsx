import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cva } from "class-variance-authority";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "cursor-pointer border no-underline transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        primary: "border-ink bg-ink text-white hover:border-ink-hover hover:bg-ink-hover",
        secondary: "border-line bg-paper text-ink hover:border-clay",
        dashed: "border-dashed border-stage-text bg-paper text-muted hover:border-clay",
        /** For actions that delete something; only inside a confirm, never as a page's main button. */
        destructive:
          "border-danger bg-danger text-white hover:border-danger-deep hover:bg-danger-deep"
      },
      size: {
        md: "rounded-md px-3.5 py-2 text-[13px]",
        lg: "rounded-lg px-4 py-2.5 text-sm font-medium"
      }
    },
    defaultVariants: { variant: "secondary", size: "md" }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Style the child element (a Link, say) as the button instead of rendering a <button>. */
    asChild?: boolean;
  };

export const Button = ({ variant, size, asChild, className, type, ...rest }: ButtonProps) =>
  asChild ? (
    <Slot className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  ) : (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    />
  );

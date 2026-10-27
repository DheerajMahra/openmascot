import type { VariantProps } from "class-variance-authority";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent",
    "font-semibold whitespace-nowrap no-underline",
    "transition-[translate,box-shadow,background-color] duration-150",
    "hover:-translate-y-px active:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0"
  ],
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-ink-hover",
        ghost: "border-line bg-paper text-ink"
      },
      size: {
        sm: "h-9 px-3.5 text-caption",
        md: "h-11.5 px-5 text-button"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

type Variants = VariantProps<typeof buttonVariants>;

/** With `href` it renders a link styled as a button; without, a `<button type="button">`. */
export type ButtonProps = Variants &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

/** Links that leave the site open in a new tab. */
const isExternal = (href: string) => /^https?:\/\//.test(href);

export const Button = ({ variant, size, className, children, ...rest }: ButtonProps) => {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (rest.href !== undefined) {
    const external = isExternal(rest.href);
    return (
      <a
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...rest}
        className={classes}
      >
        {children}
      </a>
    );
  }
  const { type, ...button } = rest;
  return (
    <button type={type ?? "button"} {...button} className={classes}>
      {children}
    </button>
  );
};

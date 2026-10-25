import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** A feature card: an illustration on top, a short title and line of copy below. */
export const Card = ({ className, ...rest }: HTMLAttributes<HTMLElement>) => (
  <article
    className={cn(
      "flex flex-col overflow-hidden rounded-card border border-hairline bg-paper shadow-hairline",
      "transition-[translate,box-shadow] duration-300 ease-spring hover:-translate-y-1 hover:shadow-card-hover",
      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      className
    )}
    {...rest}
  />
);

const cardArtVariants = cva("relative grid h-57.5 place-items-center overflow-hidden bg-dots", {
  variants: {
    tint: {
      clay: "bg-clay-tint",
      gold: "bg-gold-tint",
      lilac: "bg-lilac-tint",
      moss: "bg-moss-tint",
      blue: "bg-blue-tint"
    }
  },
  defaultVariants: { tint: "blue" }
});

type CardArtProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardArtVariants>;

/** The tinted, dotted illustration well. */
export const CardArt = ({ tint, className, ...rest }: CardArtProps) => (
  <div className={cn(cardArtVariants({ tint }), className)} {...rest} />
);

export const CardBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2 px-5.5 pt-5 pb-6 text-center", className)} {...rest} />
);

export const CardTitle = ({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-xl font-bold tracking-tight", className)} {...rest}>
    {children}
  </h3>
);

export const CardText = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-button text-muted", className)} {...rest} />
);

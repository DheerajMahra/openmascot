import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cva } from "class-variance-authority";

import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

const mascotStageVariants = cva("flex shrink-0 items-end justify-center bg-stage", {
  variants: {
    size: {
      /** Tiny backdrop behind a list thumbnail. */
      thumb: "rounded",
      card: "rounded-md",
      /** The big live preview; the same size on every step. */
      preview: "h-[280px] rounded-[10px] p-6"
    }
  },
  defaultVariants: { size: "preview" }
});

type MascotStageProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof mascotStageVariants> & { asChild?: boolean };

/** The dark floor the mascot stands on. Give it a height; the mascot sits at the bottom. */
export const MascotStage = ({ size, asChild, className, ...rest }: MascotStageProps) => {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(mascotStageVariants({ size }), className)} {...rest} />;
};

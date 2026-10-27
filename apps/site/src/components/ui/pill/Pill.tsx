import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center rounded-full font-mono font-medium whitespace-nowrap uppercase tracking-label",
  {
    variants: {
      tone: {
        /** A section label: hairline border on paper. */
        paper:
          "h-7.5 gap-2 border border-hairline bg-paper px-3 text-label text-muted shadow-hairline",
        /** Floats over an illustration. */
        float:
          "gap-1.5 border border-hairline bg-paper px-2.5 py-1.5 text-tag text-ink-soft shadow-float",
        /** Solid green, white text: the OPEN SOURCE badge. */
        moss: "bg-moss-text px-1.75 py-1 text-tag text-white"
      }
    },
    defaultVariants: { tone: "paper" }
  }
);

type PillProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof pillVariants>;

/** The rounded mono label. Badges, section labels and scene tags are all pills. */
export const Pill = ({ tone, className, ...rest }: PillProps) => (
  <span className={cn(pillVariants({ tone }), className)} {...rest} />
);

/** The small red square that opens a section label. */
export const PillMark = () => <i aria-hidden className="inline-block size-1.75 bg-red" />;

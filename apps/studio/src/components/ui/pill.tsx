import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };

/** A rounded chip for quick, lightweight actions such as "play this move". */
export const Pill = ({ active, className, ...rest }: PillProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(
      "cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[13px] transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-clay",
      className
    )}
    {...rest}
  />
);

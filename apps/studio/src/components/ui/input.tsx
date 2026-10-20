import type { ComponentProps, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Shared look of every text box and select. */
export const fieldClass =
  "rounded-md border border-line bg-paper px-2.5 py-1.5 text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clay";

export const Input = ({ className, ...rest }: ComponentProps<"input">) => (
  <input className={cn(fieldClass, className)} {...rest} />
);

export const Select = ({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(fieldClass, "cursor-pointer", className)} {...rest} />
);

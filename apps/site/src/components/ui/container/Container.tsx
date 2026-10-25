import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** The page column: centered, capped width, gutters that clear the notch. */
export const Container = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto w-full max-w-page px-gutter", className)} {...rest} />
);

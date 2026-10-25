import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A tiny browser window around a skeleton page. Children are laid over the page,
 * so position them yourself (a mascot in the corner, say).
 */
export const BrowserFrame = ({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "w-full overflow-hidden rounded-xl border border-hairline bg-paper shadow-lift",
      className
    )}
    {...rest}
  >
    <div aria-hidden className="flex gap-1.5 border-b border-hairline px-2.5 py-2">
      {[0, 1, 2].map(i => (
        <i key={i} className="block size-2 rounded-full bg-line" />
      ))}
    </div>
    <div className="relative flex min-h-24 flex-col gap-2 px-3 pt-2.5 pb-3.5 lg:min-h-30 lg:px-4 lg:pt-3.5 lg:pb-4.5">
      <span aria-hidden className="block h-3.5 w-9/20 rounded-sm bg-line" />
      <span aria-hidden className="block h-2 w-4/5 rounded-sm bg-hairline" />
      <span aria-hidden className="block h-2 w-3/5 rounded-sm bg-hairline" />
      <span aria-hidden className="block h-2 w-7/10 rounded-sm bg-hairline" />
      {children}
    </div>
  </div>
);

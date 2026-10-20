import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A large clickable card on the start screen.
 *
 *   <StartTile onClick={…}>
 *     <StartTileMedia>…</StartTileMedia>
 *     <StartTileBody title="Blobby" description="…" />
 *   </StartTile>
 */
export const StartTile = ({
  dashed,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { dashed?: boolean }) => (
  <button
    type="button"
    className={cn(
      "flex cursor-pointer flex-col overflow-hidden rounded-[10px] border bg-paper text-left text-ink transition-colors hover:border-clay",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay",
      dashed ? "border-dashed border-stage-text" : "border-line",
      className
    )}
    {...rest}
  />
);

export const StartTileMedia = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("flex h-[150px] items-end justify-center bg-stage p-4", className)}
    {...rest}
  />
);

export const StartTileBody = ({ title, description }: { title: string; description: string }) => (
  <span className="flex flex-col gap-0.5 px-3.5 py-3">
    <span className="font-mono text-sm font-semibold">{title}</span>
    <span className="text-xs text-muted">{description}</span>
  </span>
);

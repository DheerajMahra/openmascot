import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const rowBase = "grid grid-cols-(--grid-table-cols) items-center gap-2.5";

type DivProps = HTMLAttributes<HTMLDivElement>;

/**
 * A table drawn with CSS grid, so rows can hold inputs, drag handles and buttons.
 * `columns` is a grid-template-columns value; header and rows inherit it.
 */
export const GridTable = ({
  columns,
  className,
  style,
  ...rest
}: DivProps & { columns: string }) => (
  <div
    className={cn("flex flex-col", className)}
    style={{ "--grid-table-cols": columns, ...style } as CSSProperties}
    {...rest}
  />
);

export const GridTableHeader = ({ className, ...rest }: DivProps) => (
  <div
    className={cn(
      rowBase,
      "border-b border-line px-2 pb-2 font-mono text-[11px] tracking-[0.04em] text-muted uppercase",
      className
    )}
    {...rest}
  />
);

export const GridTableRow = ({ className, ...rest }: DivProps) => (
  <div className={cn(rowBase, "border-b border-line-2 p-2", className)} {...rest} />
);

/** Shown in place of rows when there are none. */
export const GridTableEmpty = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("m-0 px-2 py-3 text-[13px] text-muted", className)} {...rest} />
);

import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react";

import { PlusIcon } from "lucide-react";

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

/**
 * The last row: "+ Add …" across the full width. Spaced and ruled like a row so it reads as
 * part of the table, and highlights on hover so it reads as a button.
 */
export const GridTableAddRow = ({
  className,
  type,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type={type ?? "button"}
    className={cn(
      "flex w-full cursor-pointer items-center gap-1.5 border-b border-line-2 bg-transparent p-2 text-left font-mono text-[13px] text-muted transition-colors hover:bg-clay-tint hover:text-clay-deep focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-clay",
      className
    )}
    {...rest}
  >
    <PlusIcon size={14} aria-hidden="true" />
    {children}
  </button>
);

/** Shown in place of rows when there are none. */
export const GridTableEmpty = ({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("m-0 px-2 py-3 text-[13px] text-muted", className)} {...rest} />
);

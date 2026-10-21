import { cn } from "@/lib/utils";

/** A decorative horizontal rule. */
export const Separator = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn("my-1.5 block h-px shrink-0 bg-line", className)} />
);

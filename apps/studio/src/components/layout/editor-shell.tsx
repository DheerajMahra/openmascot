import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * The three columns every editor step shares: a narrow sidebar, the main workspace,
 * and the live preview. Each is a landmark, so pass an aria-label.
 */

type PanelProps = HTMLAttributes<HTMLElement> & { "aria-label": string };

export const EditorSidebar = ({ className, ...rest }: PanelProps) => (
  <aside
    className={cn(
      "flex min-w-0 flex-[0_1_210px] flex-col gap-2.5 border-r border-line bg-paper-2 px-3.5 py-5",
      className
    )}
    {...rest}
  />
);

export const EditorWorkspace = ({ className, ...rest }: PanelProps) => (
  <section
    className={cn(
      "flex min-w-0 flex-[999_1_560px] flex-col gap-4.5 border-r border-line px-6 py-5",
      className
    )}
    {...rest}
  />
);

export const EditorPreviewPanel = ({ className, ...rest }: PanelProps) => (
  <aside
    className={cn("flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 bg-paper-2 px-6 py-5", className)}
    {...rest}
  />
);

"use client";

import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

/** shadcn/ui Resizable (Base UI flavour) over react-resizable-panels v4, in this app's colors. */
export const ResizablePanelGroup = ({ className, ...props }: ResizablePrimitive.GroupProps) => (
  <ResizablePrimitive.Group
    data-slot="resizable-panel-group"
    className={cn("flex h-full w-full aria-[orientation=vertical]:flex-col", className)}
    {...props}
  />
);

export const ResizablePanel = ({ ...props }: ResizablePrimitive.PanelProps) => (
  <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
);

export const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & { withHandle?: boolean }) => (
  <ResizablePrimitive.Separator
    data-slot="resizable-handle"
    className={cn(
      "relative flex w-px items-center justify-center bg-line after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[separator=hover]:bg-clay focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-clay data-[separator=active]:bg-clay aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-line" />}
  </ResizablePrimitive.Separator>
);

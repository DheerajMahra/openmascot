"use client";

import type { HTMLAttributes, ReactNode } from "react";
import type { LayoutStorage } from "react-resizable-panels";

import { useDefaultLayout } from "react-resizable-panels";

import { NextStepLink } from "@/components/editor/next-step-link";
import { Stepper } from "@/components/layout/stepper";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * The columns every editor step shares: a sidebar, the main workspace, and the live preview.
 * Share has neither side column, so its workspace takes the full width. The stepper sits atop the workspace, so the side columns run up to the header. Both side columns share one size rule and can be dragged wider,
 * never narrower than SIDE_MIN. Each column is a landmark, so pass an aria-label.
 */

const SIDE_MIN = 280;
const SIDE_DEFAULT = 300;
const SIDE_MAX = 480;
const WORKSPACE_MIN = 480;

// Panels scroll natively by default; each column scrolls in a ScrollArea instead, so the
// scrollbars look the same in every browser.
const PANEL_STYLE = { overflow: "hidden" } as const;

// Widths carry over between Make and Animate for this visit. Kept in memory, not localStorage,
// so the first render always matches the server's.
const memory = new Map<string, string>();
const layoutStorage: LayoutStorage = {
  getItem: key => memory.get(key) ?? null,
  setItem: (key, value) => void memory.set(key, value)
};

export const EditorColumns = ({
  sidebar,
  workspace,
  preview
}: {
  sidebar?: ReactNode;
  workspace: ReactNode;
  preview?: ReactNode;
}) => {
  // A layout without the sidebar has different panels, so it remembers its widths separately.
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: sidebar ? "editor-columns" : "editor-columns-no-sidebar",
    storage: layoutStorage
  });

  // One column has nothing to resize.
  if (!sidebar && !preview) {
    return (
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Stepper />
        <ScrollArea className="min-h-0 flex-1">{workspace}</ScrollArea>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
      className="flex-1"
    >
      {sidebar && (
        <>
          <ResizablePanel
            id="sidebar"
            defaultSize={SIDE_DEFAULT}
            minSize={SIDE_MIN}
            maxSize={SIDE_MAX}
            style={PANEL_STYLE}
          >
            <ScrollArea className="h-full">{sidebar}</ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}
      <ResizablePanel id="workspace" minSize={WORKSPACE_MIN} style={PANEL_STYLE}>
        <div className="flex h-full flex-col">
          <Stepper />
          {/* Wide tables (triggers) can overflow sideways when the side columns are dragged wide. */}
          <ScrollArea className="min-h-0 flex-1" scrollbars="both">
            {workspace}
          </ScrollArea>
        </div>
      </ResizablePanel>
      {preview && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="preview"
            defaultSize={SIDE_DEFAULT}
            minSize={SIDE_MIN}
            maxSize={SIDE_MAX}
            style={PANEL_STYLE}
          >
            <ScrollArea className="h-full">{preview}</ScrollArea>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

type PanelProps = HTMLAttributes<HTMLElement> & { "aria-label": string };

/** Exactly as tall as its panel: put the list inside in a `SidebarList` and it scrolls alone. */
export const EditorSidebar = ({ className, ...rest }: PanelProps) => (
  <aside
    className={cn("flex h-full min-w-0 flex-col gap-2.5 bg-paper-2 px-5 py-5", className)}
    {...rest}
  />
);

/**
 * The list in a sidebar (poses, moves): as tall as its items until the sidebar runs out of room,
 * then it scrolls. Room for the scrollbar is only made while there is something to scroll.
 * `action` (a "New …" button) stays above the list, as wide as its items.
 */
export const SidebarList = ({
  className,
  action,
  children
}: {
  className?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <div className="group/side flex min-h-0 flex-col gap-2.5">
    {action && (
      <div className="flex flex-col pr-0.5 group-has-data-has-overflow-y/side:pr-3.5">{action}</div>
    )}
    <ScrollArea className="group/list flex min-h-0 flex-col" viewportClassName="h-auto">
      <div
        className={cn("flex flex-col pr-0.5 group-data-[has-overflow-y]/list:pr-3.5", className)}
      >
        {children}
      </div>
    </ScrollArea>
  </div>
);

export const EditorWorkspace = ({ className, ...rest }: PanelProps) => (
  <section
    className={cn("flex min-h-full min-w-0 flex-col gap-4.5 px-6 py-5", className)}
    {...rest}
  />
);

/** The preview column. Next stays pinned to its foot, even while the column above scrolls. */
export const EditorPreviewPanel = ({ className, children, ...rest }: PanelProps) => (
  <aside
    className={cn("flex min-h-full min-w-0 flex-col gap-3.5 bg-paper-2 px-5 pt-5", className)}
    {...rest}
  >
    {children}
    <div className="sticky bottom-0 mt-auto -mx-5 bg-paper-2 px-5 pt-1.5 pb-5">
      <NextStepLink />
    </div>
  </aside>
);

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MascotGate } from "@/components/editor/mascot-gate";
import { AppHeader } from "@/components/layout/app-header";
import { ScrollArea } from "@/components/ui/scroll-area";

/** A crawler only ever sees an empty editor here: the mascot lives in the maker's browser. */
export const metadata: Metadata = { robots: { index: false } };

/**
 * Header above the three editor screens, filling the window; the screen below scrolls on its own.
 * Every screen is for the mascot in the URL, so the gate opens it once for all three steps.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />
      <main className="flex min-h-0 flex-1">
        {/* Each screen fits exactly and scrolls inside its columns; this only scrolls on a window narrower than the columns' minimum widths. */}
        <ScrollArea className="min-w-0 flex-1" viewportClassName="flex">
          <MascotGate>{children}</MascotGate>
        </ScrollArea>
      </main>
    </div>
  );
}

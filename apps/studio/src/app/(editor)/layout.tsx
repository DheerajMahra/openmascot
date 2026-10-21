import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Stepper } from "@/components/layout/stepper";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Header + stepper around the three editor screens, filling the window; the screen below scrolls on its own. */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />
      <Stepper />
      <main className="flex min-h-0 flex-1">
        {/* Each screen fits exactly and scrolls inside its columns; this only scrolls on a window narrower than the columns' minimum widths. */}
        <ScrollArea className="min-w-0 flex-1" viewportClassName="flex">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}

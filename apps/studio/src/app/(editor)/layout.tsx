import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Stepper } from "@/components/layout/stepper";

/** Header + stepper around the three editor screens, filling the window; the screen below scrolls on its own. */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <AppHeader />
      <Stepper />
      <main className="flex min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

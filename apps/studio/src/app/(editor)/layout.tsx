import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { Stepper } from "@/components/layout/stepper";

/** Header + stepper around the three editor screens. */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <Stepper />
      <main className="flex flex-1 flex-wrap">{children}</main>
    </>
  );
}

import type { ReactNode } from "react";

import { CurrentMascotLogo } from "@/components/layout/logo";

/** Top bar: the logo, then anything passed in (pushed right with ml-auto). */
export const AppHeader = ({ children }: { children?: ReactNode }) => (
  <header className="flex h-14 items-center gap-4 border-b border-line px-6">
    <CurrentMascotLogo />
    {children}
  </header>
);

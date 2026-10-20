import type { ReactNode } from "react";

import Link from "next/link";

/** Top bar: the wordmark, then anything passed in (pushed right with ml-auto). */
export const AppHeader = ({ children }: { children?: ReactNode }) => (
  <header className="flex h-14 items-center gap-4 border-b border-line px-6">
    <Link href="/" className="font-mono text-[15px] font-semibold">
      OpenMascot
    </Link>
    {children}
  </header>
);

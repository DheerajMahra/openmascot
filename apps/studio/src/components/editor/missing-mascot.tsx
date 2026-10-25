import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Shown for a mascot id that can't be opened, e.g. one that was deleted. */
export const MissingMascot = () => (
  <section className="m-auto flex max-w-[46ch] flex-col items-center gap-3 px-6 py-16 text-center">
    <h1 className="m-0 text-xl font-semibold">Mascot not found</h1>
    <p className="m-0 text-[15px] text-muted">
      This mascot may have been deleted, or the link isn&apos;t right.
    </p>
    <Button asChild variant="primary" size="lg" className="mt-2">
      <Link href="/">Back to Start</Link>
    </Button>
  </section>
);

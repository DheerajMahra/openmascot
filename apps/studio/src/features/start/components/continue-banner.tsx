"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { timeAgo } from "@/features/start/lib/time-ago";
import { useMascotDoc, useMascotHydrated } from "@/lib/mascot-store";
import { getEditedServerSnapshot, getEditedSnapshot, subscribeEdited } from "@/lib/storage";

/** "Continue where you left off", shown once a saved mascot exists in this browser. */
export const ContinueBanner = () => {
  const doc = useMascotDoc();
  const hydrated = useMascotHydrated();
  const edited = useSyncExternalStore(subscribeEdited, getEditedSnapshot, getEditedServerSnapshot);
  if (!hydrated || !edited) return null;

  return (
    <section
      aria-label="Continue"
      className="flex flex-wrap items-center gap-4.5 rounded-[10px] border border-line bg-paper-2 px-4 py-3.5"
    >
      <MascotStage size="card" className="h-15 w-22">
        <MascotThumb doc={doc} width={66} />
      </MascotStage>
      <span className="flex min-w-0 flex-col gap-0.5">
        <SectionLabel>Continue where you left off</SectionLabel>
        <span className="font-mono text-base font-semibold">{doc.name}</span>
        <span className="text-xs text-muted">Edited {timeAgo(edited)}</span>
      </span>
      <Button asChild variant="primary" size="lg" className="ml-auto whitespace-nowrap">
        <Link href="/make">Continue →</Link>
      </Button>
    </section>
  );
};

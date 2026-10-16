"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import { Logo } from "@/components/app-header";
import { MascotPreview } from "@/components/mascot-preview";
import { MascotThumb } from "@/components/mascot-thumb";
import { Label } from "@/components/ui";
import { createBlankMascot, useMascot } from "@/lib/mascot-store";
import { SAMPLES, cloneSample } from "@/lib/samples";
import { getEditedServerSnapshot, getEditedSnapshot, subscribeEdited } from "@/lib/storage";

const ago = (iso: string): string => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const tileClass =
  "flex flex-col overflow-hidden rounded-[10px] border bg-paper text-left text-ink no-underline transition-colors hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay";

export default function StartPage() {
  const { state, dispatch } = useMascot();
  const router = useRouter();
  const edited = useSyncExternalStore(subscribeEdited, getEditedSnapshot, getEditedServerSnapshot);

  const startBlank = () => {
    dispatch({ type: "replace-doc", doc: createBlankMascot() });
    router.push("/make");
  };

  const startSample = (index: number) => {
    const sample = SAMPLES[index];
    if (!sample) return;
    dispatch({ type: "replace-doc", doc: cloneSample(sample) });
    router.push("/make");
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b border-line px-6">
        <Logo />
        <span className="ml-auto text-[13px] text-muted">Open-source pixel mascot maker</span>
      </header>

      <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-8 px-6 pt-9 pb-12">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[28px] font-semibold tracking-tight">Pick a starting point</h1>
          <p className="m-0 max-w-[60ch] text-[15px] text-muted">
            Start from a sample and change what you like, or draw from scratch. Everything stays in
            this browser.
          </p>
        </div>

        {state.hydrated && edited && (
          <section
            aria-label="Continue"
            className="flex flex-wrap items-center gap-4.5 rounded-[10px] border border-line bg-paper-2 px-4 py-3.5"
          >
            <span className="flex h-15 w-22 shrink-0 items-end justify-center rounded-md bg-stage">
              <MascotThumb doc={state.doc} width={66} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <Label>Continue where you left off</Label>
              <span className="font-mono text-base font-semibold">{state.doc.name}</span>
              <span className="text-xs text-muted">Edited {ago(edited)}</span>
            </span>
            <Link
              href="/make"
              className="ml-auto rounded-lg border border-ink bg-ink px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white no-underline hover:border-clay-deep hover:bg-clay-deep"
            >
              Continue →
            </Link>
          </section>
        )}

        <section aria-label="Start from" className="flex flex-col gap-3">
          <Label>Start from</Label>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
            <button
              type="button"
              aria-label="Start from a blank canvas"
              onClick={startBlank}
              className={`${tileClass} cursor-pointer border-dashed border-stage-text`}
            >
              <span
                className="flex h-[150px] items-center justify-center"
                style={{
                  backgroundColor: "#f6f2ec",
                  backgroundImage:
                    "linear-gradient(#e3dcd2 1px, transparent 1px), linear-gradient(90deg, #e3dcd2 1px, transparent 1px)",
                  backgroundSize: "14px 14px"
                }}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full border-2 border-white bg-clay"
                />
              </span>
              <span className="flex flex-col gap-0.5 px-3.5 py-3">
                <span className="font-mono text-sm font-semibold">Blank canvas</span>
                <span className="text-xs text-muted">
                  24 × 16 grid, four colors, an idle move ready.
                </span>
              </span>
            </button>

            {SAMPLES.map((sample, i) => (
              <button
                key={sample.doc.id}
                type="button"
                onClick={() => startSample(i)}
                className={`${tileClass} cursor-pointer border-line`}
              >
                <span className="flex h-[150px] items-end justify-center bg-stage p-4">
                  <MascotPreview doc={sample.doc} scale={6} triggers={false} />
                </span>
                <span className="flex flex-col gap-0.5 px-3.5 py-3">
                  <span className="font-mono text-sm font-semibold">{sample.doc.name}</span>
                  <span className="text-xs text-muted">{sample.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

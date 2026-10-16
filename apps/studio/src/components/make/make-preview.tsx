"use client";

import type { MascotPlayer } from "@openmascot/embed";

import Link from "next/link";
import { useRef } from "react";

import { MascotPreview } from "@/components/mascot-preview";
import { Label, Pill, Stage } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";

export const nextButtonClass =
  "mt-auto block rounded-lg border border-ink bg-ink px-4 py-2.5 text-center text-sm font-medium text-white no-underline hover:border-clay-deep hover:bg-clay-deep";

/** Right column of Make: the live mascot, a way to try moves, and Next. */
export const MakePreview = () => {
  const { state } = useMascot();
  const { doc } = state;
  const playerRef = useRef<MascotPlayer | null>(null);
  const idle = doc.triggers.idle ?? "idle";
  const moves = Object.keys(doc.sequences).filter(name => name !== idle);

  return (
    <aside
      aria-label="Live preview"
      className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 bg-paper-2 px-6 py-5"
    >
      <Label>Preview</Label>
      <Stage className="h-[280px]">
        <MascotPreview scale={8} playerRef={playerRef} />
      </Stage>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Try a move</span>
        <p className="m-0 text-[13px] leading-relaxed text-muted">
          This is exactly what your site will show. It plays the idle move while you draw.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {moves.map(name => (
          <Pill key={name} onClick={() => playerRef.current?.play(name)}>
            {name}
          </Pill>
        ))}
        {moves.length === 0 && (
          <span className="text-[13px] text-muted">No moves yet. Add some on the next step.</span>
        )}
      </div>
      <Link href="/animate" className={nextButtonClass}>
        Next: Animate →
      </Link>
    </aside>
  );
};

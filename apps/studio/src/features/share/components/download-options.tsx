"use client";

import { poseToDataUrl } from "@openmascot/embed";
import { useState } from "react";

import { Select } from "@/components/ui/input";
import { OptionCard, OptionCardDescription, OptionCardTitle } from "@/components/ui/option-card";
import { SectionLabel } from "@/components/ui/section-label";
import { download, downloadBlob } from "@/features/share/lib/download";
import { encodeMoveGif } from "@/lib/gif-encoder";
import { useEditorSelection, useMascotDoc } from "@/lib/mascot-store";

/** JSON for the embed, a GIF of one move, and a PNG of the current pose. */
export const DownloadOptions = ({ base }: { base: string }) => {
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();
  const idle = doc.triggers.idle ?? "idle";
  const moves = Object.keys(doc.sequences);
  const [gifChoice, setGifChoice] = useState<string | null>(null);
  // The doc can change under us (hydration, switching mascots); fall back to the first real move.
  const gifMove =
    gifChoice && moves.includes(gifChoice) ? gifChoice : (moves.find(m => m !== idle) ?? idle);

  const exportJson = () =>
    downloadBlob(
      new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }),
      `${base}.json`
    );
  const exportGif = () => downloadBlob(encodeMoveGif(doc, gifMove, 4), `${base}-${gifMove}.gif`);
  const exportPng = () => download(poseToDataUrl(doc, poseName, 8), `${base}-${poseName}.png`);

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Download</SectionLabel>
      <div className="grid max-w-[640px] grid-cols-1 gap-2.5 sm:grid-cols-3">
        <OptionCard onClick={exportJson}>
          <OptionCardTitle>{base}.json</OptionCardTitle>
          <OptionCardDescription>The mascot itself, for the embed script.</OptionCardDescription>
        </OptionCard>

        <OptionCard asChild className="cursor-default">
          <div>
            <button
              type="button"
              onClick={exportGif}
              className="cursor-pointer border-0 bg-transparent p-0 text-left hover:text-clay"
            >
              <OptionCardTitle>GIF of a move</OptionCardTitle>
            </button>
            <OptionCardDescription>For READMEs and chat.</OptionCardDescription>
            <Select
              aria-label="Move to export"
              value={gifMove}
              onChange={e => setGifChoice(e.target.value)}
              className="mt-1 w-full py-1 font-mono text-xs"
            >
              {moves.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
        </OptionCard>

        <OptionCard onClick={exportPng}>
          <OptionCardTitle>PNG of a pose</OptionCardTitle>
          <OptionCardDescription>
            The {poseName} pose at 8×. Pick a pose on Make to change it.
          </OptionCardDescription>
        </OptionCard>
      </div>
    </div>
  );
};

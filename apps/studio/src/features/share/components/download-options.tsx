"use client";

import { poseToDataUrl } from "@openmascot/embed";
import { useState } from "react";

import { OptionCard, OptionCardDescription, OptionCardTitle } from "@/components/ui/option-card";
import { SectionLabel } from "@/components/ui/section-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { download, downloadBlob } from "@/features/share/lib/download";
import { encodeMoveGif } from "@/lib/gif-encoder";
import { useEditorSelection, useMascotDoc } from "@/lib/mascot-store";

/** JSON for the embed, a GIF of one move, and a PNG of the current pose. */
export const DownloadOptions = ({ base }: { base: string }) => {
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();
  const moves = Object.keys(doc.sequences);
  const [gifChoice, setGifChoice] = useState<string | null>(null);
  // The doc can change under us (hydration, switching mascots); fall back to the first move.
  const gifMove = gifChoice && moves.includes(gifChoice) ? gifChoice : (moves[0] ?? "");

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
            <Select value={gifMove} onValueChange={setGifChoice}>
              <SelectTrigger
                aria-label="Move to export"
                size="sm"
                className="mt-1 w-full font-mono text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moves.map(m => (
                  <SelectItem key={m} value={m} className="font-mono text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
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

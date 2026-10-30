"use client";

import { poseToDataUrl } from "openmascot";
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

interface PickerCardProps {
  title: string;
  description: string;
  /** Names the dropdown, e.g. "Move to export". */
  pickLabel: string;
  options: string[];
  value: string;
  onValueChange: (value: string) => void;
  onDownload: () => void;
}

/**
 * A download card with a dropdown: a click anywhere but the dropdown downloads. The title button's
 * ::after covers the card, and the dropdown sits above it, so there is no button inside a button.
 */
const PickerCard = ({
  title,
  description,
  pickLabel,
  options,
  value,
  onValueChange,
  onDownload
}: PickerCardProps) => (
  <OptionCard
    asChild
    className="relative has-[>button:focus-visible]:outline-2 has-[>button:focus-visible]:outline-offset-2 has-[>button:focus-visible]:outline-clay"
  >
    <div>
      <button
        type="button"
        onClick={onDownload}
        className="cursor-pointer border-0 bg-transparent p-0 text-left outline-none after:absolute after:inset-0 after:rounded-lg"
      >
        <OptionCardTitle>{title}</OptionCardTitle>
      </button>
      <OptionCardDescription>{description}</OptionCardDescription>
      <Select value={value} onValueChange={next => next && onValueChange(next)}>
        <SelectTrigger
          aria-label={pickLabel}
          size="sm"
          className="relative z-10 mt-1 w-full font-mono text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o} value={o} className="font-mono text-xs">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </OptionCard>
);

/** JSON for the embed, a GIF of any move, and a PNG of any pose. */
export const DownloadOptions = ({ base }: { base: string }) => {
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();
  const moves = Object.keys(doc.sequences);
  const poses = Object.keys(doc.poses);
  const [gifChoice, setGifChoice] = useState<string | null>(null);
  const [pngChoice, setPngChoice] = useState<string | null>(null);
  // The doc can change under us (hydration, switching mascots); fall back to a pose or move it has.
  const gifMove = gifChoice && moves.includes(gifChoice) ? gifChoice : (moves[0] ?? "");
  const pngPose =
    pngChoice && poses.includes(pngChoice)
      ? pngChoice
      : poses.includes(poseName)
        ? poseName
        : (poses[0] ?? "");

  const exportJson = () =>
    downloadBlob(
      new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }),
      `${base}.json`
    );
  const exportGif = () => downloadBlob(encodeMoveGif(doc, gifMove, 4), `${base}-${gifMove}.gif`);
  const exportPng = () => download(poseToDataUrl(doc, pngPose, 8), `${base}-${pngPose}.png`);

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Download</SectionLabel>
      <div className="grid max-w-[640px] grid-cols-1 gap-2.5 sm:grid-cols-3">
        <OptionCard onClick={exportJson}>
          <OptionCardTitle>{base}.json</OptionCardTitle>
          <OptionCardDescription>The mascot for the embed script.</OptionCardDescription>
        </OptionCard>
        <PickerCard
          title="GIF of a move"
          description="For READMEs and chat."
          pickLabel="Move to export"
          options={moves}
          value={gifMove}
          onValueChange={setGifChoice}
          onDownload={exportGif}
        />
        <PickerCard
          title="PNG of a pose"
          description="A still image of one pose."
          pickLabel="Pose to export"
          options={poses}
          value={pngPose}
          onValueChange={setPngChoice}
          onDownload={exportPng}
        />
      </div>
    </div>
  );
};

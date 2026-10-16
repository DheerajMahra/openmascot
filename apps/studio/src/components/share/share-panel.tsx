"use client";

import { poseToDataUrl } from "@openmascot/embed";
import { useState } from "react";

import { MascotThumb } from "@/components/mascot-thumb";
import { Label, inputClass } from "@/components/ui";
import { encodeMoveGif } from "@/lib/gif-encoder";
import { useMascot } from "@/lib/mascot-store";

const download = (href: string, filename: string) => {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  download(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const cardClass =
  "flex cursor-pointer flex-col items-start gap-1 rounded-lg border border-line bg-paper p-3 text-left hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay";

/** Left column of Share: summary, downloads, and the embed snippet. */
export const SharePanel = () => {
  const { state } = useMascot();
  const { doc, poseName } = state;
  const base =
    doc.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mascot";
  const idle = doc.triggers.idle ?? "idle";
  const moves = Object.keys(doc.sequences);
  const [gifChoice, setGifMove] = useState<string | null>(null);
  // The doc can change under us (hydration, switching mascots); fall back to the first real move.
  const gifMove =
    gifChoice && moves.includes(gifChoice) ? gifChoice : (moves.find(m => m !== idle) ?? idle);
  const [copied, setCopied] = useState(false);
  const kb = (JSON.stringify(doc).length / 1024).toFixed(1);
  const ready = idle in doc.sequences && Object.keys(doc.poses).length > 0;
  const wavePose =
    Object.keys(doc.poses).find(p => p.includes("arm") || p.includes("wave")) ?? "default";

  const exportJson = () =>
    downloadBlob(
      new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }),
      `${base}.json`
    );

  const exportGif = () => downloadBlob(encodeMoveGif(doc, gifMove, 4), `${base}-${gifMove}.gif`);

  const exportPng = () => download(poseToDataUrl(doc, poseName, 8), `${base}-${poseName}.png`);

  const snippet = `<script src="embed.js" defer></script>\n<div data-mascot="${base}" data-src="/${base}.json" data-position="bottom-right"></div>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const el = document.getElementById("embed-snippet");
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <section
      aria-label="Export and embed"
      className="mx-auto flex min-w-0 flex-[0_1_680px] flex-col gap-5.5 px-6 py-8"
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-[120px] w-40 shrink-0 items-end justify-center rounded-[10px] bg-stage p-4">
          <MascotThumb doc={doc} pose={wavePose} width={120} />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="m-0 font-mono text-[22px] font-semibold">{doc.name}</h2>
          <span className="text-[13px] text-muted">
            {Object.keys(doc.poses).length} poses · {moves.length} moves · {kb} KB
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#4a7d2c]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#599036]" />
            {ready ? "Ready to use" : "Needs an idle move and a default pose"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Label>Download</Label>
        <div className="grid max-w-[640px] grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button type="button" onClick={exportJson} className={cardClass}>
            <span className="font-mono text-[13px] font-semibold">{base}.json</span>
            <span className="text-xs text-muted">The mascot itself, for the embed script.</span>
          </button>
          <div className={`${cardClass} cursor-default`}>
            <button
              type="button"
              onClick={exportGif}
              className="cursor-pointer border-0 bg-transparent p-0 text-left font-mono text-[13px] font-semibold hover:text-clay"
            >
              GIF of a move
            </button>
            <span className="text-xs text-muted">For READMEs and chat.</span>
            <select
              aria-label="Move to export"
              value={gifMove}
              onChange={e => setGifMove(e.target.value)}
              className={`${inputClass} mt-1 w-full py-1 font-mono text-xs`}
            >
              {moves.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={exportPng} className={cardClass}>
            <span className="font-mono text-[13px] font-semibold">PNG of a pose</span>
            <span className="text-xs text-muted">
              The {poseName} pose at 8×. Pick a pose on Make to change it.
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Label>Put it on a page</Label>
        <div className="relative max-w-[640px] overflow-x-auto rounded-lg bg-ink px-4.5 py-4 font-mono text-[13px] leading-relaxed text-[#f1ece4]">
          <pre id="embed-snippet" className="m-0 whitespace-pre">
            {snippet}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="absolute top-2.5 right-2.5 cursor-pointer rounded-md border border-muted bg-ink px-2.5 py-1 text-xs text-[#f1ece4] hover:border-clay"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <span className="max-w-[640px] text-[13px] leading-relaxed text-muted">
          Put <span className="font-mono text-ink">{base}.json</span> and{" "}
          <span className="font-mono text-ink">embed.js</span> next to your page. Hosting comes in a
          later version.
        </span>
      </div>
    </section>
  );
};

"use client";

import type { MascotDoc } from "openmascot";

import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { StatusBadge } from "@/components/ui/status-badge";

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Big picture, name, counts, and whether the mascot is complete enough to embed. */
export const MascotSummary = ({ doc }: { doc: MascotDoc }) => {
  const poses = Object.keys(doc.poses);
  const ready = "default" in doc.poses;
  const kb = (JSON.stringify(doc).length / 1024).toFixed(1);

  return (
    <div className="flex flex-wrap items-center gap-5">
      <MascotStage size="card" className="h-[120px] w-40 rounded-[10px] p-4">
        <MascotThumb doc={doc} pose="default" width={120} />
      </MascotStage>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="m-0 font-mono text-[22px] font-semibold">{doc.name}</h1>
        <span className="text-[13px] text-muted">
          {count(poses.length, "pose")} · {count(Object.keys(doc.sequences).length, "move")} ·{" "}
          {count(Object.keys(doc.triggers).length, "trigger")} · {kb} KB
        </span>
        <StatusBadge tone={ready ? "success" : "warning"}>
          {ready ? "Ready to use" : "Needs a default pose"}
        </StatusBadge>
      </div>
    </div>
  );
};

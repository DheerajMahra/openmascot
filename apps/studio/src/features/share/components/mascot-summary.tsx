"use client";

import type { MascotDoc } from "@openmascot/embed";

import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { StatusBadge } from "@/components/ui/status-badge";

/** Big picture, name, counts, and whether the mascot is complete enough to embed. */
export const MascotSummary = ({ doc }: { doc: MascotDoc }) => {
  const poses = Object.keys(doc.poses);
  const idle = doc.triggers.idle ?? "idle";
  const ready = idle in doc.sequences && poses.length > 0;
  const kb = (JSON.stringify(doc).length / 1024).toFixed(1);
  const heroPose = poses.find(p => p.includes("arm") || p.includes("wave")) ?? "default";

  return (
    <div className="flex flex-wrap items-center gap-5">
      <MascotStage className="h-[120px] w-40 p-4">
        <MascotThumb doc={doc} pose={heroPose} width={120} />
      </MascotStage>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="m-0 font-mono text-[22px] font-semibold">{doc.name}</h1>
        <span className="text-[13px] text-muted">
          {poses.length} poses · {Object.keys(doc.sequences).length} moves · {kb} KB
        </span>
        <StatusBadge tone={ready ? "success" : "warning"}>
          {ready ? "Ready to use" : "Needs an idle move and a default pose"}
        </StatusBadge>
      </div>
    </div>
  );
};

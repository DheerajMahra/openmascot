import type { ReactNode } from "react";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { PoseImage } from "@/components/mascot/pose-image/PoseImage";
import { MOSS } from "@/lib/mascots";

const ExportChip = ({ ext, children }: { ext: string; children: ReactNode }) => (
  <li className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-ink bg-paper px-3.5 py-3 shadow-ink-sm">
    {children}
    <span className="font-mono text-tag font-medium tracking-label text-clay-text uppercase">
      {ext}
    </span>
  </li>
);

/** The three downloads. The GIF one is a live Moss; hover it. */
export const ExportsArt = () => (
  <ul aria-label="Export formats" className="flex flex-wrap justify-center gap-2.5 sm:flex-nowrap">
    <ExportChip ext=".json">
      <PoseImage doc={MOSS} pose="default" scale={2} />
    </ExportChip>
    <ExportChip ext=".gif">
      <Mascot doc={MOSS} scale={2} label="Moss mascot, as a GIF" />
    </ExportChip>
    <ExportChip ext=".png">
      <PoseImage doc={MOSS} pose="tall" scale={2} />
    </ExportChip>
  </ul>
);

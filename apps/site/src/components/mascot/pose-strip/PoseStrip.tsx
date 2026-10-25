import type { MascotDoc } from "@openmascot/embed";

import { PoseImage } from "@/components/mascot/pose-image/PoseImage";
import { cn } from "@/lib/utils";

interface PoseStripProps {
  doc: MascotDoc;
  poses: string[];
  /** Screen pixels per cell in each frame. */
  scale: number;
  /** A pose to lift and tint, as if selected. */
  lit?: string;
  className?: string;
}

/** A row of framed pose thumbnails, like contact sheets on a table. */
export const PoseStrip = ({ doc, poses, scale, lit, className }: PoseStripProps) => (
  <ul aria-label={`${doc.name} poses`} className={cn("flex items-end gap-2.5", className)}>
    {poses.map(pose => (
      <li
        key={pose}
        className={cn(
          "rounded-lg border-2 border-ink bg-paper p-1.5 shadow-ink-sm transition-[translate,background-color] duration-200",
          pose === lit && "-translate-y-2.5 bg-gold-tint"
        )}
      >
        <PoseImage doc={doc} pose={pose} scale={scale} alt={pose} />
      </li>
    ))}
  </ul>
);

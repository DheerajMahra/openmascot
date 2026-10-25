import type { CSSProperties } from "react";

import { PixelIcon } from "@/components/ui/pixel-icon/PixelIcon";
import { cn } from "@/lib/utils";

export interface CursorSpot {
  /** CSS lengths from the top left of the cursor's positioned parent. */
  x: string;
  y: string;
  pressed?: boolean;
}

/** The pointing hand that demonstrates each scene. Glides between spots, dips when it clicks. */
export const SceneCursor = ({ spot, fast }: { spot: CursorSpot; fast?: boolean }) => (
  <span
    aria-hidden
    style={{ "--cx": spot.x, "--cy": spot.y } as CSSProperties}
    className={cn(
      "pointer-events-none absolute top-(--cy) left-(--cx) z-3 -mt-0.5 -ml-2.25 text-ink drop-shadow-md",
      "transition-[left,top] motion-reduce:transition-none",
      fast ? "duration-70 ease-linear" : "duration-300 ease-spring"
    )}
  >
    <PixelIcon
      name="hand"
      className={cn(
        "size-5.5 transition-transform duration-100",
        spot.pressed && "translate-y-0.5 scale-82"
      )}
    />
  </span>
);

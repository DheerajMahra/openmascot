"use client";

import type { Heart } from "./use-hearts";
import type { CSSProperties } from "react";

import { createPortal } from "react-dom";

import { PixelIcon } from "@/components/ui/pixel-icon/PixelIcon";

/** Hearts float up from where a mascot was petted. Fixed to the viewport, above everything. */
export const Hearts = ({ hearts }: { hearts: Heart[] }) =>
  hearts.length === 0
    ? null
    : createPortal(
        hearts.map(h => (
          <span
            key={h.id}
            aria-hidden
            className="pointer-events-none fixed top-(--y) left-(--x) z-70 -translate-1/2 animate-heart text-red"
            style={
              {
                "--x": `${h.x}px`,
                "--y": `${h.y}px`,
                "--dx": `${h.dx}px`,
                animationDelay: `${h.delay}ms`
              } as CSSProperties
            }
          >
            <PixelIcon name="heart" className="size-3.5" />
          </span>
        )),
        document.body
      );

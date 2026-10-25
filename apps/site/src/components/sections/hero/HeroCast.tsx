"use client";

import type { HeroMascot, HeroTrigger, SpriteBox, WireTarget } from "./TriggerWires";
import type { MascotDoc, MascotPlayer } from "@openmascot/embed";

import { sequencePadding } from "@openmascot/embed";
import { useMemo, useRef, useState } from "react";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { CLAWD, MOSS } from "@/lib/mascots";
import { PHONE, useMedia } from "@/lib/use-media";

import { TriggerWires } from "./TriggerWires";

/** Left to right. */
const CAST: { who: HeroMascot; doc: MascotDoc }[] = [
  { who: "moss", doc: MOSS },
  { who: "clawd", doc: CLAWD }
];

/** The filled cells of the default pose, offset by the slack the canvas keeps for moves. */
const spriteBox = (doc: MascotDoc, scale: number): SpriteBox => {
  const { w, h } = doc.grid;
  const pose = doc.poses.default ?? "";
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;
  for (let i = 0; i < w * h; i++) {
    if (pose[i] === undefined || pose[i] === ".") continue;
    const x = i % w;
    const y = Math.floor(i / w);
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  if (x1 < x0) [x0, y0, x1, y1] = [0, 0, w - 1, h - 1];
  const pad = sequencePadding(doc);
  return {
    left: (pad.left + x0) * scale,
    top: (pad.up + y0) * scale,
    width: (x1 - x0 + 1) * scale,
    height: (y1 - y0 + 1) * scale
  };
};

/**
 * Moss and Clawd side by side, and the chips that make them move. On phones they share a band
 * under the copy; on wide screens the band dissolves and all of it sits along the bottom of the hero.
 */
export const HeroCast = () => {
  const phone = useMedia(PHONE);
  const scale = phone ? 5 : 7;
  const [players, setPlayers] = useState<Partial<Record<HeroMascot, MascotPlayer | null>>>({});
  const mossRef = useRef<HTMLDivElement>(null);
  const clawdRef = useRef<HTMLDivElement>(null);
  const refs = { moss: mossRef, clawd: clawdRef };

  const targets = useMemo<Record<HeroMascot, WireTarget>>(
    () => ({
      moss: { el: mossRef, box: spriteBox(MOSS, scale) },
      clawd: { el: clawdRef, box: spriteBox(CLAWD, scale) }
    }),
    [scale]
  );

  const fire = (trigger: HeroTrigger) => {
    const player = players[trigger.who];
    if ("play" in trigger) player?.play(trigger.play);
    else player?.emit(trigger.emit);
  };

  return (
    <div className="relative h-56 w-full lg:static lg:h-auto">
      <TriggerWires targets={targets} onFire={fire} />
      <div className="absolute bottom-0 left-1/2 z-1 flex -translate-x-1/2 items-end gap-2 lg:gap-6 lg:pb-18">
        {CAST.map(({ who, doc }) => (
          <div key={who} className="flex flex-col items-center gap-1.5">
            <small className="mb-2 hidden font-mono text-label font-medium tracking-label text-muted uppercase lg:block">
              {doc.name}
            </small>
            {/* Measured by the wires: exactly the mascot's box. */}
            <div ref={refs[who]} className="leading-0">
              <Mascot
                doc={doc}
                scale={scale}
                pettable
                onPlayer={player => setPlayers(prev => ({ ...prev, [who]: player }))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

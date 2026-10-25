"use client";

import type { HeroTrigger } from "./TriggerWires";
import type { MascotPlayer } from "@openmascot/embed";

import { useState } from "react";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { CLAWD } from "@/lib/mascots";
import { PHONE, useMedia } from "@/lib/use-media";

import { TriggerWires } from "./TriggerWires";

/**
 * Clawd and the chips that make him move. On phones they share a band under the copy; on wide
 * screens the band dissolves and both sit along the bottom of the hero.
 */
export const HeroCast = () => {
  const phone = useMedia(PHONE);
  const [player, setPlayer] = useState<MascotPlayer | null>(null);

  const fire = (trigger: HeroTrigger) => {
    if ("play" in trigger) player?.play(trigger.play);
    else player?.emit(trigger.emit);
  };

  return (
    <div className="relative h-56 w-full lg:static lg:h-auto">
      <TriggerWires onFire={fire} />
      <div className="absolute bottom-0 left-1/2 z-1 flex -translate-x-1/2 flex-col items-center gap-1.5 lg:pb-18">
        <small className="mb-2 hidden font-mono text-label font-medium tracking-label text-muted uppercase lg:block">
          Clawd
        </small>
        <Mascot doc={CLAWD} scale={phone ? 5 : 7} pettable onPlayer={setPlayer} />
      </div>
    </div>
  );
};

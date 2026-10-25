import type { ReactNode, Ref } from "react";

import { Pill } from "@/components/ui/pill/Pill";
import { cn } from "@/lib/utils";

/** Phones slot each scene straight under its step: steps take the odd slots, scenes the even. */
const ORDER = ["order-2", "order-4", "order-6"] as const;

interface SceneProps {
  step: 0 | 1 | 2;
  /** On stage (desktop). Phones show every scene. */
  shown: boolean;
  /** Tag in the top left: what the scene is. */
  title: string;
  /** Tag in the top right: a live readout. */
  readout: ReactNode;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * One scene of the story. On desktop the three are stacked in the pinned stage and cross-fade;
 * on phones each is its own tile.
 */
export const Scene = ({ step, shown, title, readout, ref, children }: SceneProps) => (
  <div
    ref={ref}
    className={cn(
      ORDER[step],
      "relative mt-1 mb-10 grid h-[min(52vh,26.25rem)] grid-cols-1 place-items-center overflow-hidden",
      "rounded-tile border border-hairline bg-paper-2 px-3.5 pt-12.5 pb-12 shadow-lift",
      "lg:absolute lg:inset-0 lg:m-0 lg:h-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
      "lg:transition-[opacity,translate,scale] lg:duration-500 lg:ease-spring motion-reduce:transition-none",
      !shown && "lg:pointer-events-none lg:translate-y-6 lg:scale-98 lg:opacity-0"
    )}
  >
    <Pill tone="float" className="absolute top-3.5 left-3 lg:top-4.5 lg:left-4.5">
      {title}
    </Pill>
    <Pill tone="float" className="absolute top-3.5 right-3 tabular-nums lg:top-4.5 lg:right-4.5">
      {readout}
    </Pill>
    {children}
  </div>
);

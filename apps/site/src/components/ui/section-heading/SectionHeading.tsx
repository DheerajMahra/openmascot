import type { ReactNode } from "react";

import { Pill, PillMark } from "@/components/ui/pill/Pill";
import { Reveal } from "@/components/ui/reveal/Reveal";

interface SectionHeadingProps {
  label: string;
  /** Id of the h2, for the section's aria-labelledby. */
  id: string;
  title: ReactNode;
  lede?: ReactNode;
}

/** Centered section opener: a pill label, the h2 and an optional lede, revealed one after another. */
export const SectionHeading = ({ label, id, title, lede }: SectionHeadingProps) => (
  <div className="mb-10 flex flex-col items-center gap-4 text-center">
    <Reveal>
      <Pill>
        <PillMark />
        {label}
      </Pill>
    </Reveal>
    <Reveal order={1}>
      <h2 id={id} className="text-display leading-display font-bold tracking-display text-balance">
        {title}
      </h2>
    </Reveal>
    {lede && (
      <Reveal order={2}>
        <p className="mx-auto max-w-lede text-lede text-pretty text-muted">{lede}</p>
      </Reveal>
    )}
  </div>
);

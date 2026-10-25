import type { MascotDoc } from "@openmascot/embed";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { CAST } from "@/lib/mascots";

/**
 * One marcher. Echoes are the repeats that fill the strip: still pettable with a pointer, but
 * hidden from screen readers and skipped by Tab, so each mascot is met once.
 */
const Marcher = ({ doc, echo }: { doc: MascotDoc; echo: boolean }) => (
  <span aria-hidden={echo || undefined} className="flex items-end gap-3.5">
    <Mascot doc={doc} scale={3} pettable tabIndex={echo ? -1 : undefined} />
    <span className="pb-2 font-mono text-label font-medium tracking-label text-muted uppercase">
      {doc.name}
    </span>
  </span>
);

/** Clawd and Moss six times over: wider than any screen, so the loop never shows a gap. */
const HALF = Array.from({ length: 6 }, () => CAST).flat();
/** The track holds the row twice and slides by half its width, which lands on an identical frame. */
const TRACK = [...HALF, ...HALF];

/** Clawd and Moss march across the page. Hover or focus pauses them; reduced motion stops them. */
export const Parade = () => (
  <section
    aria-label="Clawd and Moss on parade"
    className="overflow-hidden border-y border-hairline bg-paper-2 py-6"
  >
    <div className="flex w-max animate-march gap-parade pr-parade focus-within:paused hover:paused motion-reduce:animate-none">
      {TRACK.map((doc, i) => (
        <Marcher key={i} doc={doc} echo={i >= CAST.length} />
      ))}
    </div>
  </section>
);

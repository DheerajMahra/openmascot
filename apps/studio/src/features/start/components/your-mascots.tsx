"use client";

import { SectionLabel } from "@/components/ui/section-label";
import { MascotRow } from "@/features/start/components/mascot-row";
import { useSavedMascots } from "@/features/start/hooks/use-saved-mascots";

/** Every mascot saved in this browser, newest first. Not shown at all until there is one. */
export const YourMascots = () => {
  const { mascots, remove } = useSavedMascots();
  if (!mascots?.length) return null;

  return (
    <section aria-labelledby="your-mascots" className="flex flex-col gap-3">
      <SectionLabel id="your-mascots">Your mascots</SectionLabel>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {mascots.map(mascot => (
          <li key={mascot.doc.id}>
            <MascotRow mascot={mascot} onDelete={() => void remove(mascot.doc.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
};

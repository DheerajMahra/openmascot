"use client";

import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import { useMascot } from "@/lib/mascot-store";

/** "Mascot name" box at the top of each editor sidebar. */
export const MascotNameField = () => {
  const { state, dispatch } = useMascot();
  return (
    <label htmlFor="mascot-name" className="flex flex-col">
      <SectionLabel>Mascot name</SectionLabel>
      <Input
        id="mascot-name"
        type="text"
        value={state.doc.name}
        onChange={e => dispatch({ type: "set-name", name: e.target.value })}
        className="w-full"
      />
    </label>
  );
};

"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import { UNTITLED, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";

/** "Mascot name" box at the top of each editor sidebar. Left blank, the mascot is called Untitled. */
export const MascotNameField = () => {
  const dispatch = useMascotDispatch();
  const name = useMascotSelector(s => s.doc.name);
  return (
    <Field className="gap-0">
      <FieldLabel htmlFor="mascot-name">
        <SectionLabel>Mascot name</SectionLabel>
      </FieldLabel>
      <Input
        id="mascot-name"
        type="text"
        value={name}
        onChange={e => dispatch({ type: "set-name", name: e.target.value })}
        // Clearing the box to retype is fine; leaving it blank is not.
        onBlur={() => {
          if (!name.trim()) dispatch({ type: "set-name", name: UNTITLED });
        }}
      />
    </Field>
  );
};

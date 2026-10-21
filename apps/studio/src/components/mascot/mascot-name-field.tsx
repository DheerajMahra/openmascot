"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import { useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";

/** "Mascot name" box at the top of each editor sidebar. */
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
      />
    </Field>
  );
};

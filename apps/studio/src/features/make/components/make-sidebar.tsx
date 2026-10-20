"use client";

import { EditorSidebar } from "@/components/layout/editor-shell";
import { MascotNameField } from "@/components/mascot/mascot-name-field";
import { Separator } from "@/components/ui/separator";
import { PalettePicker } from "@/features/make/components/palette-picker";
import { PoseList } from "@/features/make/components/pose-list";

/** Left column of Make: name, palette, then the pose list. */
export const MakeSidebar = () => (
  <EditorSidebar aria-label="Colors and poses">
    <MascotNameField />
    <Separator />
    <PalettePicker />
    <Separator />
    <PoseList />
  </EditorSidebar>
);

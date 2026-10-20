"use client";

import { EditorWorkspace } from "@/components/layout/editor-shell";
import { MakePreview } from "@/features/make/components/make-preview";
import { MakeSidebar } from "@/features/make/components/make-sidebar";
import { Pixelboard } from "@/features/make/components/pixelboard";
import { PoseHeader } from "@/features/make/components/pose-header";
import { TipsSlider } from "@/features/make/components/tips-slider";
import { ToolColumn } from "@/features/make/components/tool-column";
import { useUndoShortcuts } from "@/features/make/hooks/use-undo-shortcuts";

/** Step 1: draw the mascot's poses. */
export const MakeScreen = () => {
  useUndoShortcuts();

  return (
    <>
      <MakeSidebar />

      <EditorWorkspace aria-label="Pose editor">
        <PoseHeader />
        <div className="flex flex-grow flex-wrap items-start gap-4 pt-2">
          <ToolColumn />
          <div className="flex min-w-0 flex-[1_1_400px] justify-center">
            <Pixelboard />
          </div>
        </div>
        <div className="mt-auto flex justify-center pt-4 pl-14">
          <TipsSlider />
        </div>
      </EditorWorkspace>

      <MakePreview />
    </>
  );
};

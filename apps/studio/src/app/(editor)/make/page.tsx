"use client";

import { useEffect } from "react";

import { PencilIcon, TrashIcon } from "@/components/icons";
import { MakePreview } from "@/components/make/make-preview";
import { MakeSidebar } from "@/components/make/make-sidebar";
import { Pixelboard } from "@/components/make/pixelboard";
import { TipsSlider } from "@/components/make/tips-slider";
import { ToolColumn } from "@/components/make/tool-column";
import { IconBtn, Label } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";

export default function MakePage() {
  const { state, dispatch } = useMascot();
  const { poseName } = state;
  const isDefault = poseName === "default";

  // Undo / redo from the keyboard, unless the user is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  const rename = () => {
    const name = window.prompt("Rename pose:", poseName)?.trim();
    if (name && name !== poseName) dispatch({ type: "rename-pose", from: poseName, to: name });
  };

  const remove = () => {
    if (window.confirm(`Delete pose "${poseName}"? Moves using it fall back to default.`)) {
      dispatch({ type: "delete-pose", name: poseName });
    }
  };

  return (
    <>
      <MakeSidebar />

      <section
        aria-label="Pose editor"
        className="flex min-w-0 flex-[999_1_540px] flex-col gap-4 border-r border-line px-6 py-5"
      >
        <div className="flex h-7 items-center gap-2.5">
          <Label>Pose</Label>
          <span className="text-xs text-stage-text">·</span>
          <span className="font-mono text-sm font-semibold">{poseName}</span>
          <span className="ml-0.5 flex gap-1">
            <IconBtn size="sm" label="Rename pose" onClick={rename} className="text-muted">
              <PencilIcon width={13} height={13} />
            </IconBtn>
            <IconBtn
              size="sm"
              label={isDefault ? "The default pose can't be deleted" : "Delete pose"}
              disabled={isDefault}
              onClick={remove}
              className="text-muted"
            >
              <TrashIcon width={13} height={13} />
            </IconBtn>
          </span>
        </div>

        <div className="flex flex-grow flex-wrap items-start gap-4 pt-2">
          <ToolColumn />
          <div className="flex min-w-0 flex-[1_1_400px] justify-center">
            <Pixelboard />
          </div>
        </div>

        <div className="mt-auto flex justify-center pt-4 pl-14">
          <TipsSlider />
        </div>
      </section>

      <MakePreview />
    </>
  );
}

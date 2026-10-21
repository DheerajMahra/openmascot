"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEditorSelection, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { MOVE_PRESETS } from "@/lib/presets";

/** "+ New move…" menu: a preset, a copy of the current move, or an empty one. */
export const NewMoveMenu = () => {
  const dispatch = useMascotDispatch();
  const { seqName } = useEditorSelection();
  const poses = useMascotSelector(s => s.doc.poses);

  const addPreset = (id: string) => {
    const preset = MOVE_PRESETS.find(p => p.id === id);
    if (!preset) return;
    const name = id === "empty" ? "new-move" : id;
    dispatch({ type: "add-seq", name, frames: preset.build(Object.keys(poses)) });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="dashed"
            className="mt-1 flex w-full items-center gap-1.5 text-left font-normal"
          />
        }
      >
        <PlusIcon size={14} /> New move…
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {MOVE_PRESETS.filter(p => p.id !== "empty").map(p => (
          <DropdownMenuItem key={p.id} onClick={() => addPreset(p.id)}>
            {p.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => dispatch({ type: "add-seq", name: `${seqName}-copy`, from: seqName })}
        >
          Duplicate {seqName}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => addPreset("empty")}>Start empty</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

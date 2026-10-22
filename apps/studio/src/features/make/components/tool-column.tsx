"use client";

import type { Tool } from "@/lib/mascot-store";
import type { LucideIcon } from "lucide-react";

import {
  EraserIcon,
  PaintRollerIcon,
  PencilIcon,
  Redo2Icon,
  TrianglesCenterlineDashedVerticalIcon,
  Undo2Icon
} from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { BoardOptionsMenu } from "@/features/make/components/board-options-menu";
import { useEditorTool, useMascotDispatch, useUndoAvailability } from "@/lib/mascot-store";

const TOOLS: Array<{ id: Tool; label: string; Icon: LucideIcon }> = [
  { id: "pencil", label: "Pencil", Icon: PencilIcon },
  { id: "mirror", label: "Mirror pencil", Icon: TrianglesCenterlineDashedVerticalIcon },
  { id: "eraser", label: "Eraser", Icon: EraserIcon },
  { id: "fill", label: "Fill", Icon: PaintRollerIcon }
];

/** Drawing tools, undo/redo, and the ⋯ menu for board options and rare actions. */
export const ToolColumn = () => {
  const dispatch = useMascotDispatch();
  const { tool } = useEditorTool();
  const { canUndo, canRedo } = useUndoAvailability();

  return (
    <div
      role="toolbar"
      aria-label="Tools"
      aria-orientation="vertical"
      className="flex shrink-0 flex-col gap-1.5"
    >
      {TOOLS.map(({ id, label, Icon }) => (
        <IconButton
          key={id}
          label={label}
          tooltip="right"
          active={tool === id}
          onClick={() => dispatch({ type: "set-tool", tool: id })}
        >
          <Icon size={18} />
        </IconButton>
      ))}
      <IconButton
        label="Undo"
        tooltip="right"
        disabled={!canUndo}
        onClick={() => dispatch({ type: "undo" })}
      >
        <Undo2Icon size={18} />
      </IconButton>
      <IconButton
        label="Redo"
        tooltip="right"
        disabled={!canRedo}
        onClick={() => dispatch({ type: "redo" })}
      >
        <Redo2Icon size={18} />
      </IconButton>
      <BoardOptionsMenu />
    </div>
  );
};

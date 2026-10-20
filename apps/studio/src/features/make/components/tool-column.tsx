"use client";

import type { Tool } from "@/lib/mascot-store";

import { IconButton } from "@/components/ui/icon-button";
import { EraserIcon, FillIcon, PencilIcon, RedoIcon, UndoIcon } from "@/components/ui/icons";
import { BoardOptionsMenu } from "@/features/make/components/board-options-menu";
import { useEditorTool, useMascotDispatch, useUndoAvailability } from "@/lib/mascot-store";

const TOOLS: Array<{ id: Tool; label: string; Icon: typeof PencilIcon }> = [
  { id: "pencil", label: "Pencil", Icon: PencilIcon },
  { id: "eraser", label: "Eraser", Icon: EraserIcon },
  { id: "fill", label: "Fill", Icon: FillIcon }
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
          active={tool === id}
          onClick={() => dispatch({ type: "set-tool", tool: id })}
        >
          <Icon />
        </IconButton>
      ))}
      <IconButton label="Undo" disabled={!canUndo} onClick={() => dispatch({ type: "undo" })}>
        <UndoIcon />
      </IconButton>
      <IconButton label="Redo" disabled={!canRedo} onClick={() => dispatch({ type: "redo" })}>
        <RedoIcon />
      </IconButton>
      <BoardOptionsMenu />
    </div>
  );
};

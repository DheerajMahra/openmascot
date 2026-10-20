"use client";

import type { Tool } from "@/lib/mascot-store";

import { IconButton } from "@/components/ui/icon-button";
import { EraserIcon, FillIcon, PencilIcon, RedoIcon, UndoIcon } from "@/components/ui/icons";
import { BoardOptionsMenu } from "@/features/make/components/board-options-menu";
import { useMascot } from "@/lib/mascot-store";

const TOOLS: Array<{ id: Tool; label: string; Icon: typeof PencilIcon }> = [
  { id: "pencil", label: "Pencil", Icon: PencilIcon },
  { id: "eraser", label: "Eraser", Icon: EraserIcon },
  { id: "fill", label: "Fill", Icon: FillIcon }
];

/** Drawing tools, undo/redo, and the ⋯ menu for board options and rare actions. */
export const ToolColumn = () => {
  const { state, dispatch } = useMascot();

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
          active={state.tool === id}
          onClick={() => dispatch({ type: "set-tool", tool: id })}
        >
          <Icon />
        </IconButton>
      ))}
      <IconButton
        label="Undo"
        disabled={state.history.length === 0}
        onClick={() => dispatch({ type: "undo" })}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        label="Redo"
        disabled={state.future.length === 0}
        onClick={() => dispatch({ type: "redo" })}
      >
        <RedoIcon />
      </IconButton>
      <BoardOptionsMenu />
    </div>
  );
};

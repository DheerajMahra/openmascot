"use client";

import type { Tool } from "@/lib/mascot-store";

import { useEffect, useRef, useState } from "react";

import { DotsIcon, EraserIcon, FillIcon, PencilIcon, RedoIcon, UndoIcon } from "@/components/icons";
import { IconBtn } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";

const TOOLS: Array<{ id: Tool; label: string; Icon: typeof PencilIcon }> = [
  { id: "pencil", label: "Pencil", Icon: PencilIcon },
  { id: "eraser", label: "Eraser", Icon: EraserIcon },
  { id: "fill", label: "Fill", Icon: FillIcon }
];

/** Tools, undo/redo, and the ⋯ menu for board options and rare actions. */
export const ToolColumn = () => {
  const { state, dispatch } = useMascot();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isDefault = state.poseName === "default";

  return (
    <div role="toolbar" aria-label="Tools" className="flex shrink-0 flex-col gap-1.5">
      {TOOLS.map(({ id, label, Icon }) => (
        <IconBtn
          key={id}
          label={label}
          active={state.tool === id}
          onClick={() => dispatch({ type: "set-tool", tool: id })}
        >
          <Icon />
        </IconBtn>
      ))}
      <IconBtn
        label="Undo"
        disabled={state.history.length === 0}
        onClick={() => dispatch({ type: "undo" })}
      >
        <UndoIcon />
      </IconBtn>
      <IconBtn
        label="Redo"
        disabled={state.future.length === 0}
        onClick={() => dispatch({ type: "redo" })}
      >
        <RedoIcon />
      </IconBtn>
      <div ref={menuRef} className="relative">
        <IconBtn
          label="More board options"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen(v => !v)}
        >
          <DotsIcon />
        </IconBtn>
        {open && (
          <div
            role="menu"
            aria-label="Board options"
            className="absolute top-0 left-12 z-10 flex w-52 flex-col rounded-lg border border-line bg-paper p-1.5 text-[13px] shadow-[0_6px_20px_rgba(29,26,23,0.12)]"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 whitespace-nowrap hover:bg-paper-2">
              <input
                type="checkbox"
                checked={state.board.centerLines}
                onChange={e =>
                  dispatch({
                    type: "set-board-option",
                    option: "centerLines",
                    value: e.target.checked
                  })
                }
              />
              Center lines
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 whitespace-nowrap hover:bg-paper-2">
              <input
                type="checkbox"
                checked={state.board.groundLine}
                onChange={e =>
                  dispatch({
                    type: "set-board-option",
                    option: "groundLine",
                    value: e.target.checked
                  })
                }
              />
              Ground line
            </label>
            <span aria-hidden="true" className="mx-1.5 my-1 h-px bg-line-2" />
            <button
              type="button"
              role="menuitem"
              disabled={isDefault}
              onClick={() => {
                dispatch({ type: "reset-pose", name: state.poseName });
                setOpen(false);
              }}
              className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[13px] whitespace-nowrap text-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:text-stage-text"
            >
              Reset to default pose
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                dispatch({ type: "clear-pose", name: state.poseName });
                setOpen(false);
              }}
              className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[13px] whitespace-nowrap text-clay-deep hover:bg-paper-2"
            >
              Clear pose
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

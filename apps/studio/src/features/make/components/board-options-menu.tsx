"use client";

import { EllipsisIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { useBoardOptions, useEditorSelection, useMascotDispatch } from "@/lib/mascot-store";

/** The ⋯ menu: board guides, plus resetting or clearing the current pose. */
export const BoardOptionsMenu = () => {
  const dispatch = useMascotDispatch();
  const board = useBoardOptions();
  const { poseName } = useEditorSelection();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<IconButton label="More board options" tooltip="right" />}>
        <EllipsisIcon size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label="Board options" side="right" align="start" className="w-52">
        <DropdownMenuCheckboxItem
          checked={board.centerLines}
          onCheckedChange={value =>
            dispatch({ type: "set-board-option", option: "centerLines", value })
          }
        >
          Center lines
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={board.groundLine}
          onCheckedChange={value =>
            dispatch({ type: "set-board-option", option: "groundLine", value })
          }
        >
          Ground line
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={poseName === "default"}
          onClick={() => dispatch({ type: "reset-pose", name: poseName })}
        >
          Reset to default pose
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => dispatch({ type: "clear-pose", name: poseName })}
        >
          Clear pose
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

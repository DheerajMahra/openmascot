"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { DotsIcon } from "@/components/ui/icons";
import { useBoardOptions, useEditorSelection, useMascotDispatch } from "@/lib/mascot-store";

/** The ⋯ menu: board guides, plus resetting or clearing the current pose. */
export const BoardOptionsMenu = () => {
  const dispatch = useMascotDispatch();
  const board = useBoardOptions();
  const { poseName } = useEditorSelection();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton label="More board options">
          <DotsIcon />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent label="Board options" className="top-0 left-12">
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
          onSelect={() => dispatch({ type: "reset-pose", name: poseName })}
        >
          Reset to default pose
        </DropdownMenuItem>
        <DropdownMenuItem
          destructive
          onSelect={() => dispatch({ type: "clear-pose", name: poseName })}
        >
          Clear pose
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

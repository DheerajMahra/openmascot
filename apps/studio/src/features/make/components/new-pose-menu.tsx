"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEditorSelection, useMascotDispatch } from "@/lib/mascot-store";

/** "+ New pose…" menu: a copy of default, or a copy of the current pose. */
export const NewPoseMenu = () => {
  const dispatch = useMascotDispatch();
  const { poseName } = useEditorSelection();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="dashed" className="flex items-center gap-1.5 text-left font-mono" />
        }
      >
        <PlusIcon size={14} /> New pose…
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => dispatch({ type: "add-pose", from: "default" })}>
          Start from default
        </DropdownMenuItem>
        {/* A copy of default is what "Start from default" already makes. */}
        {poseName !== "default" && (
          <DropdownMenuItem onClick={() => dispatch({ type: "add-pose", from: poseName })}>
            Duplicate {poseName}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

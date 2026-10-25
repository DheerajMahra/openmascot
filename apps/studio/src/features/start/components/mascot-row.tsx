"use client";

import type { SavedMascot } from "@/lib/mascot-repository";

import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { timeAgo } from "@/features/start/lib/time-ago";
import { UNTITLED } from "@/lib/mascot-store";

/**
 * One saved mascot on the Start page. The whole row opens it (the name's link stretches over the
 * row); the ⋯ menu sits above that link and holds Delete, which asks first.
 */
export const MascotRow = ({
  mascot: { doc, updatedAt },
  onDelete
}: {
  mascot: SavedMascot;
  onDelete: () => void;
}) => {
  const [confirming, setConfirming] = useState(false);
  const name = doc.name.trim() || UNTITLED;

  return (
    <div className="relative flex items-center gap-4.5 rounded-[10px] border border-line bg-paper-2 px-4 py-3.5 transition-colors hover:border-clay has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-clay">
      <MascotStage size="card" className="h-15 w-22 shrink-0">
        <MascotThumb doc={doc} width={66} />
      </MascotStage>
      <span className="flex min-w-0 flex-col gap-0.5">
        <Link
          href={`/make/${doc.id}`}
          className="truncate font-mono text-base font-semibold text-ink no-underline outline-none after:absolute after:inset-0 after:rounded-[10px]"
        >
          {name}
        </Link>
        <span className="text-xs text-muted">Edited {timeAgo(updatedAt)}</span>
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              label={`More options for ${name}`}
              variant="ghost"
              className="relative z-10 ml-auto"
            />
          }
        >
          <EllipsisIcon size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label={`${name} options`} align="end" className="w-40">
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirming(false);
                onDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

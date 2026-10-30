"use client";

import type { MascotDoc, MascotFrame } from "openmascot";
import type { HTMLAttributes } from "react";

import { GripVerticalIcon, XIcon } from "lucide-react";

import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { GridTableRow } from "@/components/ui/grid-table";
import { IconButton } from "@/components/ui/icon-button";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { holdOf } from "@/features/animate/lib/timeline";
import { cn } from "@/lib/utils";

interface Props {
  /** Mascot the step belongs to, for the thumbnail and the grid bounds. */
  doc: MascotDoc;
  index: number;
  frame: MascotFrame;
  poses: string[];
  /** Shown or playing in the preview right now. */
  active: boolean;
  /** A dragged row is hovering here. */
  dropTarget: boolean;
  canRemove: boolean;
  handleProps: HTMLAttributes<HTMLButtonElement> & { draggable: boolean };
  rowProps: HTMLAttributes<HTMLDivElement>;
  onSelect: () => void;
  onChange: (frame: Partial<MascotFrame>) => void;
  onRemove: () => void;
}

/** One step of a move: which pose, for how long, and how far it's nudged. */
export const StepRow = ({
  doc,
  index,
  frame,
  poses,
  active,
  dropTarget,
  canRemove,
  handleProps,
  rowProps,
  onSelect,
  onChange,
  onRemove
}: Props) => {
  const n = index + 1;

  return (
    <GridTableRow
      aria-current={active ? "true" : undefined}
      className={cn(
        "transition-colors hover:bg-paper-2",
        active && "rounded-lg border border-clay bg-clay-tint p-[7px] hover:bg-clay-tint",
        dropTarget && "border-t-2 border-t-clay"
      )}
      {...rowProps}
    >
      <button
        type="button"
        aria-label={`Reorder pose ${n}: drag, or use the arrow keys`}
        className="flex h-6 w-3.5 cursor-grab items-center justify-center border-0 bg-transparent p-0 text-stage-text hover:text-muted active:cursor-grabbing"
        {...handleProps}
      >
        <GripVerticalIcon size={14} />
      </button>
      <button
        type="button"
        aria-label={`Show pose ${n} in the preview`}
        onClick={onSelect}
        className={cn(
          "cursor-pointer border-0 bg-transparent p-0 text-left font-mono text-xs hover:text-clay",
          active ? "font-semibold text-ink" : "text-muted"
        )}
      >
        {n}
      </button>
      <span className="flex min-w-0 items-center gap-2">
        <MascotStage asChild size="thumb">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={onSelect}
            className="h-[30px] w-10 cursor-pointer border-0 p-0 hover:outline-2 hover:outline-clay"
          >
            <MascotThumb doc={doc} pose={frame.pose} width={33} />
          </button>
        </MascotStage>
        <Select value={frame.pose} onValueChange={pose => pose && onChange({ pose })}>
          <SelectTrigger aria-label={`Pose ${n}`} size="sm" className="min-w-0 flex-1 font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {poses.map(p => (
              <SelectItem key={p} value={p} className="font-mono">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
      <NumberInput
        label={`Hold pose ${n}, in frames`}
        min={1}
        max={120}
        value={holdOf(frame)}
        onChange={hold => onChange({ hold })}
      />
      <NumberInput
        label={`Move pose ${n} down, in rows (negative is up)`}
        min={-doc.grid.h}
        max={doc.grid.h}
        value={frame.offset ?? 0}
        onChange={offset => onChange({ offset })}
      />
      <NumberInput
        label={`Slide pose ${n} sideways, in columns`}
        min={-doc.grid.w}
        max={doc.grid.w}
        value={frame.x ?? 0}
        onChange={x => onChange({ x })}
      />
      <IconButton
        size="md"
        variant="ghost"
        label={canRemove ? `Remove pose ${n}` : "A move needs at least one pose"}
        disabled={!canRemove}
        onClick={onRemove}
      >
        <XIcon size={12} />
      </IconButton>
    </GridTableRow>
  );
};

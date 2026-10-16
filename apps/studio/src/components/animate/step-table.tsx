"use client";

import type { MascotFrame } from "@openmascot/embed";
import type { DragEvent, KeyboardEvent } from "react";

import { useState } from "react";

import { NumberField } from "@/components/animate/number-field";
import { CloseIcon, GripIcon, PencilIcon, TrashIcon } from "@/components/icons";
import { MascotThumb } from "@/components/mascot-thumb";
import { Btn, IconBtn, Label, inputClass } from "@/components/ui";
import { useMascot } from "@/lib/mascot-store";
import { DEFAULT_HOLD, secondsOf, ticksOf } from "@/lib/presets";

interface Props {
  /** Row to highlight: the one being shown or played in the preview. */
  activeStep: number | null;
  /** The user clicked a row; the preview should hold that step. */
  onSelectStep: (index: number) => void;
}

const COLS =
  "grid grid-cols-[14px_18px_minmax(160px,1fr)_96px_96px_96px_28px] items-center gap-2.5";

/** The poses of one move, one row each: drag handle, pose, Hold, Down, Slide, remove. */
export const StepTable = ({ activeStep, onSelectStep }: Props) => {
  const { state, dispatch } = useMascot();
  const { doc, seqName } = state;
  const frames = doc.sequences[seqName] ?? [];
  const poses = Object.keys(doc.poses);
  const isIdle = seqName === (doc.triggers.idle ?? "idle");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const setFrame = (index: number, frame: Partial<MascotFrame>) =>
    dispatch({ type: "set-frame", seq: seqName, index, frame });

  const rename = () => {
    const to = window.prompt("Rename move:", seqName)?.trim();
    if (to && to !== seqName) dispatch({ type: "rename-seq", from: seqName, to });
  };

  const remove = () => {
    if (window.confirm(`Delete the "${seqName}" move? Its triggers go with it.`)) {
      dispatch({ type: "delete-seq", name: seqName });
    }
  };

  const onDragStart = (e: DragEvent<HTMLButtonElement>, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    setDragFrom(index);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, to: number) => {
    e.preventDefault();
    const from = dragFrom ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
    setDragFrom(null);
    setDragOver(null);
    if (Number.isNaN(from) || from === to) return;
    dispatch({ type: "reorder-frame", seq: seqName, from, to });
    onSelectStep(to);
  };

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const dir = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : null;
    if (dir === null) return;
    e.preventDefault();
    const to = index + dir;
    if (to < 0 || to >= frames.length) return;
    dispatch({ type: "move-frame", seq: seqName, index, dir });
    onSelectStep(to);
  };

  return (
    <>
      <div className="flex h-7 flex-wrap items-center gap-2.5">
        <Label>Move</Label>
        <span className="text-xs text-stage-text">·</span>
        <span className="font-mono text-sm font-semibold">{seqName}</span>
        <span className="ml-0.5 flex gap-1">
          <IconBtn
            size="sm"
            label={isIdle ? "The idle move keeps its name" : "Rename move"}
            disabled={isIdle}
            onClick={rename}
            className="text-muted"
          >
            <PencilIcon width={13} height={13} />
          </IconBtn>
          <IconBtn
            size="sm"
            label={isIdle ? "The idle move can't be deleted" : "Delete move"}
            disabled={isIdle}
            onClick={remove}
            className="text-muted"
          >
            <TrashIcon width={13} height={13} />
          </IconBtn>
        </span>
        <span className="ml-auto font-mono text-xs text-muted">
          {frames.length} pose{frames.length === 1 ? "" : "s"} · {ticksOf(frames)} frames ·{" "}
          {secondsOf(frames, doc.tick)} s
        </span>
      </div>

      <div aria-label={`Poses in the ${seqName} move`} className="flex flex-col">
        <div
          className={`${COLS} border-b border-line px-2 pb-2 font-mono text-[11px] uppercase tracking-[0.04em] text-muted`}
        >
          <span aria-label="Drag to reorder" />
          <span>#</span>
          <span>Pose</span>
          <span>
            Hold <span className="normal-case">(frames)</span>
          </span>
          <span>
            Down <span className="normal-case">(rows)</span>
          </span>
          <span>
            Slide <span className="normal-case">(cols)</span>
          </span>
          <span aria-label="Remove" />
        </div>

        {frames.map((frame, i) => {
          const active = i === activeStep;
          return (
            <div
              key={i}
              aria-current={active ? "true" : undefined}
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== i) setDragOver(i);
              }}
              onDragLeave={() => {
                if (dragOver === i) setDragOver(null);
              }}
              onDrop={e => onDrop(e, i)}
              className={[
                COLS,
                "transition-colors",
                active
                  ? "rounded-lg border border-clay bg-clay-tint p-[7px]"
                  : "border-b border-line-2 p-2 hover:bg-paper-2",
                dragOver === i && dragFrom !== i ? "border-t-2 border-t-clay" : ""
              ].join(" ")}
            >
              <button
                type="button"
                draggable
                aria-label={`Reorder pose ${i + 1}: drag, or use the arrow keys`}
                title="Drag to reorder"
                onDragStart={e => onDragStart(e, i)}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onKeyDown={e => onHandleKey(e, i)}
                className="flex h-6 w-3.5 cursor-grab items-center justify-center border-0 bg-transparent p-0 text-stage-text hover:text-muted active:cursor-grabbing"
              >
                <GripIcon width={14} height={14} />
              </button>
              <button
                type="button"
                aria-label={`Show pose ${i + 1} in the preview`}
                title="Show in the preview"
                onClick={() => onSelectStep(i)}
                className={`cursor-pointer border-0 bg-transparent p-0 text-left font-mono text-xs hover:text-clay ${active ? "font-semibold text-ink" : "text-muted"}`}
              >
                {i + 1}
              </button>
              <span className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  aria-label={`Show pose ${i + 1} in the preview`}
                  title="Show in the preview"
                  onClick={() => onSelectStep(i)}
                  className="flex h-[30px] w-10 shrink-0 cursor-pointer items-end justify-center rounded border-0 bg-stage p-0 hover:outline-2 hover:outline-clay"
                >
                  <MascotThumb doc={doc} pose={frame.pose} width={33} />
                </button>
                <select
                  aria-label={`Pose ${i + 1}`}
                  value={frame.pose}
                  onChange={e => setFrame(i, { pose: e.target.value })}
                  className={`${inputClass} min-w-0 flex-1 px-1.5 py-1.5 font-mono`}
                >
                  {poses.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </span>
              <NumberField
                label={`Hold pose ${i + 1}, in frames`}
                min={1}
                max={120}
                value={Math.max(1, Math.floor(frame.hold) || 1)}
                onChange={hold => setFrame(i, { hold })}
              />
              <NumberField
                label={`Move pose ${i + 1} down, in rows (negative is up)`}
                min={-doc.grid.h}
                max={doc.grid.h}
                value={frame.offset ?? 0}
                onChange={offset => setFrame(i, { offset })}
              />
              <NumberField
                label={`Slide pose ${i + 1} sideways, in columns`}
                min={-doc.grid.w}
                max={doc.grid.w}
                value={frame.x ?? 0}
                onChange={x => setFrame(i, { x })}
              />
              <IconBtn
                size="sm"
                label={
                  frames.length <= 1 ? "A move needs at least one pose" : `Remove pose ${i + 1}`
                }
                disabled={frames.length <= 1}
                onClick={() => dispatch({ type: "remove-frame", seq: seqName, index: i })}
                className="h-7 w-7 border-transparent bg-transparent text-muted hover:border-line"
              >
                <CloseIcon width={12} height={12} />
              </IconBtn>
            </div>
          );
        })}

        <Btn
          variant="dashed"
          className="mt-2.5 self-start font-mono"
          onClick={() =>
            dispatch({
              type: "add-frame",
              seq: seqName,
              frame: { pose: "default", hold: DEFAULT_HOLD }
            })
          }
        >
          + Add pose
        </Btn>
      </div>
    </>
  );
};

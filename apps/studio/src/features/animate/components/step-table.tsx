"use client";

import { GridTable, GridTableAddRow, GridTableHeader } from "@/components/ui/grid-table";
import { StepRow } from "@/features/animate/components/step-row";
import { useStepReorder } from "@/features/animate/hooks/use-step-reorder";
import { useEditorSelection, useMascotDispatch, useMascotDoc } from "@/lib/mascot-store";
import { DEFAULT_HOLD } from "@/lib/presets";

export const STEP_COLUMNS = "14px 18px minmax(160px,1fr) 96px 96px 96px 28px";

interface Props {
  /** Row to highlight: the one being shown or played in the preview. */
  activeStep: number | null;
  /** The user clicked a row; the preview should hold that step. */
  onSelectStep: (index: number) => void;
}

/** The poses of one move, one row each: drag handle, pose, Hold, Down, Slide, remove. */
export const StepTable = ({ activeStep, onSelectStep }: Props) => {
  const dispatch = useMascotDispatch();
  const doc = useMascotDoc();
  const { seqName } = useEditorSelection();
  const frames = doc.sequences[seqName] ?? [];
  const poses = Object.keys(doc.poses);

  const reorder = useStepReorder({
    count: frames.length,
    onReorder: (from, to) => {
      dispatch({ type: "reorder-frame", seq: seqName, from, to });
      onSelectStep(to);
    },
    onMove: (index, dir) => {
      dispatch({ type: "move-frame", seq: seqName, index, dir });
      onSelectStep(index + dir);
    }
  });

  return (
    <GridTable columns={STEP_COLUMNS} aria-label={`Poses in the ${seqName} move`}>
      <GridTableHeader>
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
      </GridTableHeader>

      {frames.map((frame, i) => (
        <StepRow
          key={i}
          doc={doc}
          index={i}
          frame={frame}
          poses={poses}
          active={i === activeStep}
          dropTarget={reorder.isDropTarget(i)}
          canRemove={frames.length > 1}
          handleProps={reorder.handleProps(i)}
          rowProps={reorder.rowProps(i)}
          onSelect={() => onSelectStep(i)}
          onChange={patch => dispatch({ type: "set-frame", seq: seqName, index: i, frame: patch })}
          onRemove={() => dispatch({ type: "remove-frame", seq: seqName, index: i })}
        />
      ))}

      <GridTableAddRow
        onClick={() =>
          dispatch({
            type: "add-frame",
            seq: seqName,
            frame: { pose: "default", hold: DEFAULT_HOLD }
          })
        }
      >
        Add pose
      </GridTableAddRow>
    </GridTable>
  );
};

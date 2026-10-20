"use client";

import { Select } from "@/components/ui/input";
import { useEditorSelection, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { MOVE_PRESETS } from "@/lib/presets";

const DUPLICATE = "duplicate";

/** "+ New move…" picker: a preset, a copy of the current move, or an empty one. */
export const NewMoveSelect = () => {
  const dispatch = useMascotDispatch();
  const { seqName } = useEditorSelection();
  const poses = useMascotSelector(s => s.doc.poses);

  const addMove = (id: string) => {
    if (id === DUPLICATE) {
      dispatch({ type: "add-seq", name: `${seqName}-copy`, from: seqName });
      return;
    }
    const preset = MOVE_PRESETS.find(p => p.id === id);
    if (!preset) return;
    const name = id === "empty" ? "new-move" : id;
    dispatch({ type: "add-seq", name, frames: preset.build(Object.keys(poses)) });
  };

  return (
    <Select
      aria-label="New move"
      value=""
      onChange={e => addMove(e.target.value)}
      className="mt-1 border-dashed border-stage-text text-muted"
    >
      <option value="" disabled>
        + New move…
      </option>
      {MOVE_PRESETS.filter(p => p.id !== "empty").map(p => (
        <option key={p.id} value={p.id}>
          {p.label}
        </option>
      ))}
      <option value={DUPLICATE}>Duplicate {seqName}</option>
      <option value="empty">Start empty</option>
    </Select>
  );
};

"use client";

import {
  DeleteAction,
  EntityHeader,
  EntityHeaderActions,
  EntityHeaderMeta,
  EntityHeaderTitle,
  RenameAction
} from "@/components/editor/entity-header";
import { useEditorSelection, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";
import { secondsOf, ticksOf } from "@/lib/presets";

/** "MOVE · wave" with rename, delete, and the move's length. The last move can't be deleted. */
export const MoveHeader = () => {
  const dispatch = useMascotDispatch();
  const { seqName } = useEditorSelection();
  const frames = useMascotSelector(s => s.doc.sequences[seqName]) ?? [];
  const tick = useMascotSelector(s => s.doc.tick);
  const isLast = useMascotSelector(s => Object.keys(s.doc.sequences).length <= 1);

  const rename = () => {
    const to = window.prompt("Rename move:", seqName)?.trim();
    if (to && to !== seqName) dispatch({ type: "rename-seq", from: seqName, to });
  };

  const remove = () => {
    if (window.confirm(`Delete the "${seqName}" move? Its triggers go with it.`)) {
      dispatch({ type: "delete-seq", name: seqName });
    }
  };

  return (
    <EntityHeader>
      <EntityHeaderTitle kind="Move" name={seqName} />
      <EntityHeaderActions>
        <RenameAction label="Rename move" onClick={rename} />
        <DeleteAction
          label={isLast ? "A mascot needs at least one move" : "Delete move"}
          disabled={isLast}
          onClick={remove}
        />
      </EntityHeaderActions>
      <EntityHeaderMeta>
        {frames.length} pose{frames.length === 1 ? "" : "s"} · {ticksOf(frames)} frames ·{" "}
        {secondsOf(frames, tick)} s
      </EntityHeaderMeta>
    </EntityHeader>
  );
};

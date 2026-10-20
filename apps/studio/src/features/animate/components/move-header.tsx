"use client";

import {
  DeleteAction,
  EntityHeader,
  EntityHeaderActions,
  EntityHeaderMeta,
  EntityHeaderTitle,
  RenameAction
} from "@/components/editor/entity-header";
import { useMascot } from "@/lib/mascot-store";
import { secondsOf, ticksOf } from "@/lib/presets";

/** "MOVE · idle" with rename, delete, and the move's length. The idle move is fixed. */
export const MoveHeader = () => {
  const { state, dispatch } = useMascot();
  const { doc, seqName } = state;
  const frames = doc.sequences[seqName] ?? [];
  const isIdle = seqName === (doc.triggers.idle ?? "idle");

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
        <RenameAction
          label={isIdle ? "The idle move keeps its name" : "Rename move"}
          disabled={isIdle}
          onClick={rename}
        />
        <DeleteAction
          label={isIdle ? "The idle move can't be deleted" : "Delete move"}
          disabled={isIdle}
          onClick={remove}
        />
      </EntityHeaderActions>
      <EntityHeaderMeta>
        {frames.length} pose{frames.length === 1 ? "" : "s"} · {ticksOf(frames)} frames ·{" "}
        {secondsOf(frames, doc.tick)} s
      </EntityHeaderMeta>
    </EntityHeader>
  );
};

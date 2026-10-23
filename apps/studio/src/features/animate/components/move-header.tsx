"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
  DeleteAction,
  EntityHeader,
  EntityHeaderActions,
  EntityHeaderMeta,
  EntityHeaderRenameForm,
  EntityHeaderTitle,
  RenameAction
} from "@/components/editor/entity-header";
import {
  toMoveName,
  useEditorSelection,
  useMascotDispatch,
  useMascotSelector
} from "@/lib/mascot-store";
import { secondsOf, ticksOf } from "@/lib/presets";

/** "MOVE · wave" with rename, delete, and the move's length. The last move can't be deleted. */
export const MoveHeader = () => {
  const dispatch = useMascotDispatch();
  const { seqName } = useEditorSelection();
  const sequences = useMascotSelector(s => s.doc.sequences);
  const frames = sequences[seqName] ?? [];
  const tick = useMascotSelector(s => s.doc.tick);
  const isLast = Object.keys(sequences).length <= 1;
  // The move being renamed; picking another move closes the form.
  const [renaming, setRenaming] = useState<string | null>(null);
  const renameButton = useRef<HTMLButtonElement>(null);

  // Put keyboard focus back on the pencil once the form is gone.
  const closeRename = () => {
    flushSync(() => setRenaming(null));
    renameButton.current?.focus();
  };

  const validate = (draft: string): string | null => {
    const name = toMoveName(draft);
    if (!name) return "Give the move a name.";
    if (name !== seqName && name in sequences) return `There's already a move called "${name}".`;
    return null;
  };

  return (
    <EntityHeader>
      {renaming === seqName ? (
        <EntityHeaderRenameForm
          kind="Move"
          name={seqName}
          validate={validate}
          onSave={draft => {
            dispatch({ type: "rename-seq", from: seqName, to: draft });
            closeRename();
          }}
          onCancel={closeRename}
        />
      ) : (
        <>
          <EntityHeaderTitle kind="Move" name={seqName} />
          <EntityHeaderActions>
            <RenameAction
              ref={renameButton}
              label="Rename move"
              onClick={() => setRenaming(seqName)}
            />
            <DeleteAction
              label={isLast ? "A mascot needs at least one move" : "Delete move"}
              disabled={isLast}
              confirm={{
                title: `Delete the "${seqName}" move?`,
                description: "Its triggers are deleted with it."
              }}
              onDelete={() => dispatch({ type: "delete-seq", name: seqName })}
            />
          </EntityHeaderActions>
        </>
      )}
      <EntityHeaderMeta>
        {frames.length} pose{frames.length === 1 ? "" : "s"} · {ticksOf(frames)} frames ·{" "}
        {secondsOf(frames, tick)} s
      </EntityHeaderMeta>
    </EntityHeader>
  );
};

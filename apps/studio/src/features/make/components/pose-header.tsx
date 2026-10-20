"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
  DeleteAction,
  EntityHeader,
  EntityHeaderActions,
  EntityHeaderRenameForm,
  EntityHeaderTitle,
  RenameAction
} from "@/components/editor/entity-header";
import {
  toPoseName,
  useEditorSelection,
  useMascotDispatch,
  useMascotSelector
} from "@/lib/mascot-store";

/** "POSE · default" with rename and delete. The default pose can't be renamed or deleted. */
export const PoseHeader = () => {
  const dispatch = useMascotDispatch();
  const poses = useMascotSelector(s => s.doc.poses);
  const { poseName } = useEditorSelection();
  const isDefault = poseName === "default";
  // The pose being renamed; picking another pose closes the form.
  const [renaming, setRenaming] = useState<string | null>(null);
  const renameButton = useRef<HTMLButtonElement>(null);

  // Put keyboard focus back on the pencil once the form is gone.
  const closeRename = () => {
    flushSync(() => setRenaming(null));
    renameButton.current?.focus();
  };

  const validate = (draft: string): string | null => {
    const name = toPoseName(draft);
    if (!name) return "Give the pose a name.";
    if (name !== poseName && name in poses) return `There's already a pose called "${name}".`;
    return null;
  };

  const remove = () => {
    if (window.confirm(`Delete pose "${poseName}"? Moves using it fall back to default.`)) {
      dispatch({ type: "delete-pose", name: poseName });
    }
  };

  return (
    <EntityHeader>
      {renaming === poseName ? (
        <EntityHeaderRenameForm
          kind="Pose"
          name={poseName}
          validate={validate}
          onSave={draft => {
            dispatch({ type: "rename-pose", from: poseName, to: draft });
            closeRename();
          }}
          onCancel={closeRename}
        />
      ) : (
        <>
          <EntityHeaderTitle kind="Pose" name={poseName} />
          <EntityHeaderActions>
            <RenameAction
              ref={renameButton}
              label={isDefault ? "The default pose can't be renamed" : "Rename pose"}
              disabled={isDefault}
              onClick={() => setRenaming(poseName)}
            />
            <DeleteAction
              label={isDefault ? "The default pose can't be deleted" : "Delete pose"}
              disabled={isDefault}
              onClick={remove}
            />
          </EntityHeaderActions>
        </>
      )}
    </EntityHeader>
  );
};

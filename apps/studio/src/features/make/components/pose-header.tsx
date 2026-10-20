"use client";

import {
  DeleteAction,
  EntityHeader,
  EntityHeaderActions,
  EntityHeaderTitle,
  RenameAction
} from "@/components/editor/entity-header";
import { useEditorSelection, useMascotDispatch } from "@/lib/mascot-store";

/** "POSE · default" with rename and delete. The default pose can't be deleted. */
export const PoseHeader = () => {
  const dispatch = useMascotDispatch();
  const { poseName } = useEditorSelection();
  const isDefault = poseName === "default";

  const rename = () => {
    const name = window.prompt("Rename pose:", poseName)?.trim();
    if (name && name !== poseName) dispatch({ type: "rename-pose", from: poseName, to: name });
  };

  const remove = () => {
    if (window.confirm(`Delete pose "${poseName}"? Moves using it fall back to default.`)) {
      dispatch({ type: "delete-pose", name: poseName });
    }
  };

  return (
    <EntityHeader>
      <EntityHeaderTitle kind="Pose" name={poseName} />
      <EntityHeaderActions>
        <RenameAction label="Rename pose" onClick={rename} />
        <DeleteAction
          label={isDefault ? "The default pose can't be deleted" : "Delete pose"}
          disabled={isDefault}
          onClick={remove}
        />
      </EntityHeaderActions>
    </EntityHeader>
  );
};

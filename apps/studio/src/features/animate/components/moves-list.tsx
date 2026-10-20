"use client";

import { SelectableItem } from "@/components/editor/selectable-item";
import { EditorSidebar } from "@/components/layout/editor-shell";
import { MascotNameField } from "@/components/mascot/mascot-name-field";
import { InfoTip } from "@/components/ui/info-tip";
import { SectionLabel } from "@/components/ui/section-label";
import { Separator } from "@/components/ui/separator";
import { NewMoveSelect } from "@/features/animate/components/new-move-select";
import {
  triggersFor,
  useEditorSelection,
  useMascotDispatch,
  useMascotDoc
} from "@/lib/mascot-store";
import { describeTriggers } from "@/lib/presets";

const MOVES_HELP =
  "A move is a few poses shown one after another, like a flipbook. idle plays whenever nothing else is. Pick a move to edit its poses; the Triggers table says when each one plays.";

/** Left column of Animate: every move with when it plays, and a way to start a new one. */
export const MovesList = () => {
  const dispatch = useMascotDispatch();
  const doc = useMascotDoc();
  const { seqName } = useEditorSelection();

  return (
    <EditorSidebar aria-label="Moves">
      <MascotNameField />
      <Separator />

      <SectionLabel>
        Moves
        <InfoTip label="About moves" text={MOVES_HELP} />
      </SectionLabel>
      <div className="flex flex-col gap-2">
        {Object.keys(doc.sequences).map(name => (
          <SelectableItem
            key={name}
            selected={name === seqName}
            onClick={() => dispatch({ type: "select-seq", name })}
            className="justify-between gap-2 px-3 py-2.5"
          >
            <span className="truncate font-mono text-[13px]">{name}</span>
            <span className="shrink-0 truncate text-[11px] text-muted">
              {describeTriggers(doc, name, triggersFor(doc, name))}
            </span>
          </SelectableItem>
        ))}
      </div>
      <NewMoveSelect />
      <p className="mt-1.5 mb-0 text-xs leading-relaxed text-muted">
        {doc.triggers.idle ?? "idle"} loops whenever nothing else is playing.
      </p>
    </EditorSidebar>
  );
};

"use client";

import { SelectableItem } from "@/components/editor/selectable-item";
import { EditorSidebar, SidebarList } from "@/components/layout/editor-shell";
import { MascotNameField } from "@/components/mascot/mascot-name-field";
import { InfoTip } from "@/components/ui/info-tip";
import { SectionLabel } from "@/components/ui/section-label";
import { Separator } from "@/components/ui/separator";
import { NewMoveMenu } from "@/features/animate/components/new-move-menu";
import {
  triggersFor,
  useEditorSelection,
  useMascotDispatch,
  useMascotDoc
} from "@/lib/mascot-store";
import { describeTriggers } from "@/lib/presets";

const MOVES_HELP =
  "A move is a few poses shown one after another, like a flipbook. Each one plays once, then the mascot rests on its default pose. Pick a move to edit its poses; the Triggers table says when each one plays.";

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
      <SidebarList className="gap-2">
        {Object.keys(doc.sequences).map(name => (
          <SelectableItem
            key={name}
            selected={name === seqName}
            onClick={() => dispatch({ type: "select-seq", name })}
            className="justify-between gap-2 px-3 py-2.5"
          >
            <span className="truncate font-mono text-[13px]">{name}</span>
            <span className="shrink-0 truncate text-[11px] text-muted">
              {describeTriggers(triggersFor(doc, name))}
            </span>
          </SelectableItem>
        ))}
      </SidebarList>
      <NewMoveMenu />
      <p className="mt-1.5 mb-0 text-xs leading-relaxed text-muted">
        To repeat a move, give it an &quot;every few seconds&quot; trigger.
      </p>
    </EditorSidebar>
  );
};

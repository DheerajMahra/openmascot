"use client";

import {
  GridTable,
  GridTableAddRow,
  GridTableEmpty,
  GridTableHeader
} from "@/components/ui/grid-table";
import { SectionLabel } from "@/components/ui/section-label";
import { TriggerRow } from "@/features/animate/components/trigger-row";
import { useEditorSelection, useMascotDispatch, useMascotSelector } from "@/lib/mascot-store";

// Play is as wide as the step table's Hold + Down + Slide (3 × 96px plus two 10px gaps), so
// it lines up under them. When and Detail share what is left 3:2, and shrink far enough that this
// table never needs more room than the step table above it.
const TRIGGER_COLUMNS = "18px minmax(98px,3fr) minmax(76px,2fr) 308px 28px";

/**
 * Every trigger of the mascot: when something happens on the page, which move plays.
 * Each "when" is a key of doc.triggers, so no two rows share one.
 */
export const TriggersTable = () => {
  const dispatch = useMascotDispatch();
  const { seqName } = useEditorSelection();
  const triggers = useMascotSelector(s => s.doc.triggers);
  const rows = Object.entries(triggers);

  return (
    <div className="flex flex-col gap-2.5 border-t border-line pt-4">
      <SectionLabel>Triggers</SectionLabel>
      <GridTable columns={TRIGGER_COLUMNS} aria-label="Triggers">
        <GridTableHeader>
          <span>#</span>
          <span>When</span>
          <span>Detail</span>
          <span>Play</span>
          <span aria-label="Remove" />
        </GridTableHeader>

        {rows.map(([key, seq], i) => (
          <TriggerRow key={key} number={i + 1} triggerKey={key} seq={seq} />
        ))}

        {rows.length === 0 && (
          <GridTableEmpty>
            No triggers yet. Moves without one only play from the preview.
          </GridTableEmpty>
        )}

        <GridTableAddRow onClick={() => dispatch({ type: "add-trigger", seq: seqName })}>
          Add trigger
        </GridTableAddRow>
      </GridTable>
    </div>
  );
};

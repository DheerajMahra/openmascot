"use client";

import { Button } from "@/components/ui/button";
import { GridTable, GridTableEmpty, GridTableHeader } from "@/components/ui/grid-table";
import { SectionLabel } from "@/components/ui/section-label";
import { TriggerRow } from "@/features/animate/components/trigger-row";
import { useMascot } from "@/lib/mascot-store";

const TRIGGER_COLUMNS = "18px minmax(150px,1fr) 140px minmax(150px,1fr) 28px";

/**
 * Every trigger of the mascot: when something happens on the page, which move plays.
 * Each "when" is a key of doc.triggers, so no two rows share one.
 */
export const TriggersTable = () => {
  const { state, dispatch } = useMascot();
  const { doc, seqName } = state;
  const rows = Object.entries(doc.triggers).filter(([key]) => key !== "idle");

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

        <Button
          variant="dashed"
          className="mt-2.5 self-start font-mono"
          onClick={() => dispatch({ type: "add-trigger", seq: seqName })}
        >
          + Add trigger
        </Button>
      </GridTable>
      <p className="m-0 text-xs leading-relaxed text-muted">
        &quot;My site sends&quot; fires from page code:{" "}
        <span className="font-mono text-ink">Mascot.emit(&quot;name&quot;)</span>.
      </p>
    </div>
  );
};

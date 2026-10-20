"use client";

import { SelectableItem } from "@/components/editor/selectable-item";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { SectionLabel } from "@/components/ui/section-label";
import { useEditorSelection, useMascotDispatch, useMascotDoc } from "@/lib/mascot-store";

const POSES_HELP =
  "A pose is one drawing of your mascot. Moves switch between poses. A new pose starts as a copy of default, so change only what differs: eyes, arms, mouth.";

/** Every pose with a thumbnail; pick one to draw on it. */
export const PoseList = () => {
  const dispatch = useMascotDispatch();
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();

  const addPose = () => {
    const name = window.prompt("Name the new pose:", "")?.trim();
    if (name) dispatch({ type: "add-pose", name, from: "default" });
  };

  return (
    <>
      <SectionLabel className="h-6">
        Poses
        <InfoTip label="About poses" text={POSES_HELP} />
      </SectionLabel>
      <div className="flex max-h-[380px] flex-col gap-1.5 overflow-y-auto pr-0.5">
        {Object.keys(doc.poses).map(name => (
          <SelectableItem
            key={name}
            selected={name === poseName}
            onClick={() => dispatch({ type: "select-pose", name })}
            className="px-2 py-1.5 font-mono text-[13px]"
          >
            <MascotStage size="thumb" className="h-8 w-12">
              <MascotThumb doc={doc} pose={name} width={36} />
            </MascotStage>
            <span className="truncate">{name}</span>
          </SelectableItem>
        ))}
      </div>
      <Button variant="dashed" className="text-left font-mono" onClick={addPose}>
        + New pose
      </Button>
    </>
  );
};

"use client";

import { SelectableItem, scrollIntoView } from "@/components/editor/selectable-item";
import { SidebarList } from "@/components/layout/editor-shell";
import { MascotStage } from "@/components/mascot/mascot-stage";
import { MascotThumb } from "@/components/mascot/mascot-thumb";
import { InfoTip } from "@/components/ui/info-tip";
import { SectionLabel } from "@/components/ui/section-label";
import { NewPoseMenu } from "@/features/make/components/new-pose-menu";
import { useEditorSelection, useMascotDispatch, useMascotDoc } from "@/lib/mascot-store";

const POSES_HELP =
  "A pose is one drawing of your mascot. Moves switch between poses. Start a new pose from default or from the pose you have open, then change only what differs: eyes, arms, mouth.";

/** Every pose with a thumbnail; pick one to draw on it. */
export const PoseList = () => {
  const dispatch = useMascotDispatch();
  const doc = useMascotDoc();
  const { poseName } = useEditorSelection();

  return (
    <>
      <SectionLabel className="h-6">
        Poses
        <InfoTip label="About poses" text={POSES_HELP} />
      </SectionLabel>
      <SidebarList className="gap-1.5" action={<NewPoseMenu />}>
        {Object.keys(doc.poses).map(name => (
          <SelectableItem
            key={name}
            ref={name === poseName ? scrollIntoView : undefined}
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
      </SidebarList>
    </>
  );
};

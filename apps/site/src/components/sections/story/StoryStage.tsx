"use client";

import { RotateCcwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PHONE, useMedia } from "@/lib/use-media";
import { cn } from "@/lib/utils";

import { AnimateScene } from "./scenes/AnimateScene";
import { MakeScene } from "./scenes/MakeScene";
import { ShareScene } from "./scenes/ShareScene";
import { STEP_COUNT, StorySteps } from "./StorySteps";
import { useActiveStep } from "./use-active-step";
import { useScenesInView } from "./use-scenes-in-view";

const SCENES = [MakeScene, AnimateScene, ShareScene];

/**
 * Desktop: steps scroll past a stage pinned just under the header, and the step level with it
 * plays its scene. Each step is as tall as the stage, so the stage's top edge arrives level
 * with the first step's label and leaves level with the last.
 * Phones: the stage dissolves (`display: contents`), each scene sits under its step and plays
 * when it scrolls into view.
 */
export const StoryStage = () => {
  const phone = useMedia(PHONE);
  const [active, setActive] = useState(0);
  /** Desktop: the stage is on screen. Until then, no scene plays. */
  const [onStage, setOnStage] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  /** The step whose current run has finished, so its replay button can show. */
  const [finished, setFinished] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);

  useActiveStep(stageRef, stepRefs, !phone, (step, visible) => {
    // Called only on a change, and any change starts a fresh run.
    setFinished(null);
    setActive(step);
    setOnStage(visible);
  });
  const inView = useScenesInView(sceneRefs, STEP_COUNT, phone);

  // Steps are as tall as the stage, which follows the column width.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () =>
      rootRef.current?.style.setProperty("--stage-h", `${stage.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const replay = () => {
    setFinished(null);
    setReplayKey(k => k + 1);
  };
  const canReplay = !phone && onStage && finished === active;

  return (
    <div
      ref={rootRef}
      className="flex flex-col lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-story-gap"
    >
      <StorySteps active={phone ? null : active} stepRefs={stepRefs} />
      <div className="contents lg:sticky lg:top-24 lg:block">
        <div className="contents lg:relative lg:block lg:w-full">
          <div
            ref={stageRef}
            aria-hidden
            className="contents lg:relative lg:block lg:aspect-5/4 lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-hidden lg:rounded-stage lg:border lg:border-hairline lg:bg-paper-2 lg:shadow-stage"
          >
            {SCENES.map((SceneView, i) => (
              <SceneView
                key={i}
                ref={el => {
                  sceneRefs.current[i] = el;
                }}
                active={phone ? (inView[i] ?? false) : onStage && active === i}
                replayKey={replayKey}
                onDone={() => setFinished(i)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Replay this step"
            onClick={replay}
            inert={!canReplay}
            className={cn(
              "absolute right-3.5 bottom-3.5 z-4 hidden size-9.5 cursor-pointer place-items-center rounded-full border border-hairline bg-paper text-ink-soft shadow-float lg:grid",
              "transition-[opacity,scale,rotate,color] duration-300 motion-reduce:transition-none",
              canReplay
                ? "hover:-rotate-30 hover:text-clay-text"
                : "pointer-events-none scale-80 opacity-0"
            )}
          >
            <RotateCcwIcon aria-hidden className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
};

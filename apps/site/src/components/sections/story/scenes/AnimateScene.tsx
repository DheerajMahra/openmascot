"use client";

import type { SceneProps } from "./types";
import type { MascotElement } from "openmascot/react";
import type { CSSProperties } from "react";

import { useRef } from "react";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { PoseImage } from "@/components/mascot/pose-image/PoseImage";
import { PixelIcon } from "@/components/ui/pixel-icon/PixelIcon";
import { PHONE, useMedia } from "@/lib/use-media";
import { cn } from "@/lib/utils";

import { useSceneRunner } from "../use-scene-runner";
import { Scene } from "./Scene";
import { SceneCursor } from "./SceneCursor";
import { HOP, SCENE_DOC, moveLength, useAnimateScript } from "./use-animate-script";

// Tall enough for the header, timeline, all four rows of the hop and the add row.
const panel = "h-56 rounded-xl border border-hairline bg-paper shadow-lift lg:h-64";

/** Step 2: the cursor builds Moss's hop row by row in a move table, then presses Play. */
export const AnimateScene = ({ active, replayKey, onDone, ref }: SceneProps) => {
  const phone = useMedia(PHONE);
  const editor = useRef<HTMLDivElement>(null);
  const add = useRef<HTMLDivElement>(null);
  const play = useRef<HTMLSpanElement>(null);
  const player = useRef<MascotElement | null>(null);
  const { state, run, finish } = useAnimateScript({ editor, add, play, player });
  useSceneRunner({ active, replayKey, play: run, finish, onDone });
  const length = moveLength(state.rows);

  return (
    <Scene
      ref={ref}
      step={1}
      shown={active}
      title="Animate · Moss"
      readout={
        // Small phones drop the frame count so the tag clears the title beside it.
        <span>
          {length.poses}
          <span className="hidden sm:inline"> · {length.frames}</span> · {length.seconds}
        </span>
      }
    >
      <div
        ref={editor}
        className="relative grid w-full grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-stretch gap-2 lg:w-9/10 lg:max-w-135 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-3"
      >
        <div
          className={cn(
            panel,
            "relative grid items-end justify-items-center overflow-hidden p-2 pb-3.5 lg:p-2.5 lg:pb-6"
          )}
        >
          <span
            aria-hidden
            className="absolute inset-2 rounded-md bg-board bg-board-grid-sm ring-1 ring-hairline lg:inset-2.5"
          />
          <Mascot
            doc={SCENE_DOC}
            scale={phone ? 4 : 6}
            triggers={false}
            label="Moss mascot, playing the hop"
            ref={player}
            className="relative z-1"
          />
        </div>
        <div className={cn(panel, "flex min-w-0 flex-col overflow-hidden")}>
          <div className="flex items-center justify-between gap-2 border-b border-hairline py-1.5 pr-1.5 pl-2.5 lg:py-2 lg:pr-2 lg:pl-3">
            <span className="font-mono text-caption font-medium">hop</span>
            <span
              ref={play}
              className={cn(
                "inline-flex h-6.5 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                state.playLit
                  ? "border-moss-text bg-moss-text text-white"
                  : "border-line bg-paper text-ink-soft"
              )}
            >
              <PixelIcon name="play" className="size-2.25" />
              Play
            </span>
          </div>
          <div className="h-1 overflow-hidden bg-paper-2">
            <i
              style={{ "--fill": `${state.progress * 100}%` } as CSSProperties}
              className="block h-full w-(--fill) bg-leaf transition-[width] duration-60 ease-linear"
            />
          </div>
          <table className="w-full border-collapse font-mono text-tag tabular-nums lg:text-xs">
            <thead>
              <tr>
                <th className="w-5.5 border-b border-hairline bg-paper-2 px-2.25 py-1.5 text-left text-tag font-medium tracking-label text-muted uppercase">
                  #
                </th>
                <th className="border-b border-hairline bg-paper-2 px-2.25 py-1.5 text-left text-tag font-medium tracking-label text-muted uppercase">
                  Pose
                </th>
              </tr>
            </thead>
            <tbody>
              {HOP.slice(0, state.rows).map((frame, i) => (
                <tr
                  key={i}
                  className={cn(
                    "animate-row-in motion-reduce:animate-none",
                    state.live === i && "bg-moss-tint"
                  )}
                >
                  <td
                    className={cn(
                      "border-b border-hairline px-2.25 py-1.25 text-muted",
                      state.live === i && "text-moss-text shadow-live"
                    )}
                  >
                    {i + 1}
                  </td>
                  <td className="border-b border-hairline px-2.25 py-1.25 whitespace-nowrap text-ink">
                    <span className="inline-flex items-center gap-1.75">
                      <PoseImage
                        doc={SCENE_DOC}
                        pose={frame.pose}
                        scale={1.25}
                        className="hidden rounded-sm border border-hairline bg-paper-2 lg:block"
                      />
                      {frame.pose}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            ref={add}
            className={cn(
              "mt-auto border-t border-dashed border-line px-2.5 py-2 font-mono text-tag lg:text-xs",
              state.addLit ? "bg-paper-2 text-ink" : "text-muted"
            )}
          >
            + Add pose
          </div>
        </div>
        <SceneCursor spot={state.cursor} />
      </div>
    </Scene>
  );
};

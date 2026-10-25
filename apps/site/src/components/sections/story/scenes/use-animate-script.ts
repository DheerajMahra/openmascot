"use client";

import type { SceneRun } from "../use-scene-runner";
import type { CursorSpot } from "./SceneCursor";
import type { MascotDoc, MascotFrame, MascotPlayer } from "@openmascot/embed";
import type { RefObject } from "react";

import { useState } from "react";

import { MOSS } from "@/lib/mascots";

/** The move the scene builds: Moss's hop, one row at a time. */
export const HOP: MascotFrame[] = [
  { pose: "squish", hold: 2, poof: "dot" },
  { pose: "tall", hold: 3 },
  { pose: "default", hold: 1 },
  { pose: "squish", hold: 2 }
];
export const HOP_NAME = "hop-preset";
export const SCENE_DOC: MascotDoc = { ...MOSS, sequences: { ...MOSS.sequences, [HOP_NAME]: HOP } };

const ticks = (frames: MascotFrame[]) =>
  frames.reduce((n, f) => n + Math.max(1, Math.floor(f.hold)), 0);
/** Which row is on screen at each tick of the hop. */
const ROW_AT_TICK = HOP.flatMap((f, row) => Array.from({ length: Math.max(1, f.hold) }, () => row));

/** The move's length, in the studio's terms: poses, frames, seconds. */
export const moveLength = (rows: number) => {
  const frames = ticks(HOP.slice(0, rows));
  return {
    poses: `${rows} pose${rows === 1 ? "" : "s"}`,
    frames: `${frames} frames`,
    seconds: `${((frames * MOSS.tick) / 1000).toFixed(2)} s`
  };
};

export interface AnimateState {
  rows: number;
  addLit: boolean;
  playLit: boolean;
  /** Row highlighted while the hop plays, or -1. */
  live: number;
  /** Timeline fill, 0 to 1. */
  progress: number;
  cursor: CursorSpot;
}

const AT_REST: AnimateState = {
  rows: 0,
  addLit: false,
  playLit: false,
  live: -1,
  progress: 0,
  cursor: { x: "0px", y: "0px" }
};

interface Targets {
  editor: RefObject<HTMLElement | null>;
  add: RefObject<HTMLElement | null>;
  play: RefObject<HTMLElement | null>;
  player: RefObject<MascotPlayer | null>;
}

/** Center of `el` inside the editor, nudged by dx, dy. */
const spotOn = (
  editor: HTMLElement | null,
  el: HTMLElement | null,
  dx: number,
  dy: number
): CursorSpot => {
  if (!editor || !el) return AT_REST.cursor;
  const box = editor.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: `${r.left - box.left + r.width / 2 + dx}px`,
    y: `${r.top - box.top + r.height / 2 + dy}px`
  };
};

/** The animate scene's state and its script: add four rows with the cursor, press Play, follow the hop. */
export const useAnimateScript = ({ editor, add, play, player }: Targets) => {
  const [state, setState] = useState<AnimateState>(AT_REST);
  const set = (patch: Partial<AnimateState>) => setState(s => ({ ...s, ...patch }));
  const cursorTo = (
    el: RefObject<HTMLElement | null>,
    dx: number,
    dy: number,
    pressed = false
  ) => ({ ...spotOn(editor.current, el.current, dx, dy), pressed });

  const run = async ({ wait }: SceneRun) => {
    setState({ ...AT_REST, cursor: cursorTo(add, -40, 30) });
    await wait(600);
    for (let i = 0; i < HOP.length; i++) {
      set({ addLit: true, cursor: cursorTo(add, -30 + i * 6, 2) });
      await wait(380);
      set({ cursor: cursorTo(add, -30 + i * 6, 2, true) });
      await wait(120);
      set({ addLit: false, rows: i + 1, cursor: cursorTo(add, -30 + i * 6, 2) });
      await wait(420);
    }
    set({ cursor: cursorTo(play, 0, 2) });
    await wait(500);
    set({ cursor: cursorTo(play, 0, 2, true) });
    await wait(120);
    set({ playLit: true, cursor: cursorTo(play, 0, 2) });
    player.current?.play(HOP_NAME);
    for (let t = 0; t < ROW_AT_TICK.length; t++) {
      set({ live: ROW_AT_TICK[t] ?? -1, progress: (t + 1) / ROW_AT_TICK.length });
      await wait(MOSS.tick);
    }
    set({ live: -1, progress: 0, playLit: false });
    await wait(300);
  };

  const finish = () => setState({ ...AT_REST, rows: HOP.length, cursor: cursorTo(play, 0, 2) });

  return { state, run, finish };
};

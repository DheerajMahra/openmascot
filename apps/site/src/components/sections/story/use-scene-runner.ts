"use client";

import { useEffect, useEffectEvent } from "react";

import { REDUCED_MOTION, useMedia } from "@/lib/use-media";

export interface SceneRun {
  /** Resolves after `ms`, or rejects if the scene stops first, which ends the script. */
  wait: (ms: number) => Promise<void>;
}

interface SceneScript {
  /** True while the scene is on stage (desktop) or has scrolled into view (phones). */
  active: boolean;
  /** Bump to play again from the top. */
  replayKey: number;
  /** The scripted animation. Reset the scene's state first, then await `run.wait` between beats. */
  play: (run: SceneRun) => Promise<void>;
  /** Jump straight to the final frame. Used instead of `play` under reduced motion. */
  finish: () => void;
  /** Called once a run reaches its end, not when it is cut short. */
  onDone: () => void;
}

/**
 * Plays a scene's script once each time it becomes active or is replayed, and cancels every
 * pending timer when it goes inactive or unmounts.
 */
export const useSceneRunner = ({ active, replayKey, play, finish, onDone }: SceneScript) => {
  const reduced = useMedia(REDUCED_MOTION);
  const runScript = useEffectEvent(play);
  const jumpToEnd = useEffectEvent(finish);
  const done = useEffectEvent(onDone);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      jumpToEnd();
      done();
      return;
    }
    const stop = new AbortController();
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        stop.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(stop.signal.reason);
          },
          { once: true }
        );
      });
    runScript({ wait }).then(
      () => done(),
      (error: unknown) => {
        if (!stop.signal.aborted) throw error;
      }
    );
    return () => stop.abort();
    // replayKey is read by nothing inside: a new value is the signal to start over.
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [active, replayKey, reduced]);
};

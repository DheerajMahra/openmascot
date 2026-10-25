import type { Ref } from "react";

/** What the story stage hands every scene. */
export interface SceneProps {
  /** Play now: on stage (desktop) or scrolled into view (phones). */
  active: boolean;
  /** Bumped by the replay button to play again from the top. */
  replayKey: number;
  /** The run reached its end; the replay button may show. */
  onDone: () => void;
  ref?: Ref<HTMLDivElement>;
}

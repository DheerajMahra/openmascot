"use client";

import type { SceneProps } from "./types";
import type { CodeToken } from "@/components/ui/code-block/CodeBlock";
import type { MascotPlayer } from "@openmascot/embed";

import { moss } from "@openmascot/samples";
import { useRef, useState } from "react";

import { Mascot } from "@/components/mascot/mascot/Mascot";
import { BrowserFrame } from "@/components/ui/browser-frame/BrowserFrame";
import { CodeBlock, codeLength } from "@/components/ui/code-block/CodeBlock";
import { MOSS } from "@/lib/mascots";
import { cn } from "@/lib/utils";

import { useSceneRunner } from "../use-scene-runner";
import { Scene } from "./Scene";

const t = (kind: CodeToken["kind"], text: string): CodeToken => ({ kind, text });

const SNIPPET: CodeToken[][] = [
  [
    t("punct", "<"),
    t("tag", "script"),
    t("attr", " src"),
    t("punct", "="),
    t("value", '"embed.js"'),
    t("attr", " defer"),
    t("punct", "></"),
    t("tag", "script"),
    t("punct", ">")
  ],
  [
    t("punct", "<"),
    t("tag", "div"),
    t("attr", " data-mascot"),
    t("punct", "="),
    t("value", '"moss"'),
    t("attr", " data-src"),
    t("punct", "="),
    t("value", '"/moss.json"'),
    t("attr", " data-position"),
    t("punct", "="),
    t("value", '"bottom-right"'),
    t("punct", "></"),
    t("tag", "div"),
    t("punct", ">")
  ]
];
const CHARS = codeLength(SNIPPET);

/** The download the snippet points at: the sample file as it ships. */
const FILE_SIZE = `${(new TextEncoder().encode(JSON.stringify(moss)).length / 1024).toFixed(1)} KB`;

/** Step 3: the embed snippet types itself, then Moss pops into the corner of a page. */
export const ShareScene = ({ active, replayKey, onDone, ref }: SceneProps) => {
  const [typed, setTyped] = useState(CHARS);
  const [arrived, setArrived] = useState(true);
  const player = useRef<MascotPlayer | null>(null);

  useSceneRunner({
    active,
    replayKey,
    onDone,
    play: async ({ wait }) => {
      setArrived(false);
      // About 15 ms a character: the whole snippet types in under two seconds.
      for (let i = 0; i <= CHARS; i++) {
        setTyped(i);
        await wait(10 + Math.random() * 10);
      }
      await wait(300);
      setArrived(true);
      player.current?.play("hop");
      await wait(700);
    },
    finish: () => {
      setTyped(CHARS);
      setArrived(true);
    }
  });

  return (
    <Scene ref={ref} step={2} shown={active} title="Share · moss.json" readout={FILE_SIZE}>
      <div className="flex w-full max-w-full min-w-0 flex-col items-center gap-2.5 justify-self-center lg:w-43/50 lg:max-w-125 lg:gap-3.5">
        <CodeBlock
          lines={SNIPPET}
          shown={typed}
          caret
          className="px-3 py-2.5 text-tag leading-relaxed lg:min-h-19 lg:px-4.5 lg:py-4 lg:text-code"
        />
        <BrowserFrame>
          <span
            className={cn(
              "absolute right-3 bottom-2 origin-bottom transition-transform duration-450 ease-pop motion-reduce:transition-none",
              arrived ? "scale-100" : "scale-0"
            )}
          >
            <Mascot
              doc={MOSS}
              scale={3}
              triggers={false}
              onPlayer={p => {
                player.current = p;
              }}
            />
          </span>
        </BrowserFrame>
      </div>
    </Scene>
  );
};

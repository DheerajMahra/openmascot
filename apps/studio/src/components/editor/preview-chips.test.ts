import type { MascotDoc } from "@openmascot/embed";

import { describe, expect, it } from "vitest";

import { previewChips } from "@/components/editor/preview-chips";
import { createBlankMascot } from "@/lib/mascot-store";

const STEP = [{ pose: "default", hold: 4 }];

/** A blank mascot with these moves and triggers. */
const docWith = (moves: string[], triggers: Record<string, string> = {}): MascotDoc => ({
  ...createBlankMascot(),
  sequences: Object.fromEntries(moves.map(m => [m, STEP])),
  triggers
});

describe("previewChips", () => {
  it("lists moves in doc order", () => {
    expect(previewChips(docWith(["wave", "bounce", "spin"])).moves).toEqual([
      "wave",
      "bounce",
      "spin"
    ]);
  });

  it("labels triggers with shortTrigger, in doc order, with the move each one plays", () => {
    const doc = docWith(["wave", "spin", "cheer"], {
      hover: "wave",
      "interval:6": "spin",
      "custom:success": "cheer"
    });
    expect(previewChips(doc).triggers).toEqual([
      { key: "hover", label: "on hover", seq: "wave" },
      { key: "interval:6", label: "every 6 s", seq: "spin" },
      { key: "custom:success", label: 'on "success"', seq: "cheer" }
    ]);
  });

  it("gives no trigger chips when the mascot has no triggers", () => {
    expect(previewChips(docWith(["bounce"])).triggers).toEqual([]);
  });
});

import type { MascotDoc } from "openmascot";

import { describe, expect, it } from "vitest";

import { encodeMoveGif, moveRoom } from "@/lib/gif-encoder";

describe("moveRoom", () => {
  it("needs no room for a move that stays put", () => {
    expect(moveRoom([{ pose: "default", hold: 1 }])).toEqual({ left: 0, right: 0, up: 0 });
  });

  it("makes room on each side only as far as the move slides that way", () => {
    const frames = [
      { pose: "default", hold: 1, x: -2 },
      { pose: "default", hold: 1, x: 5 }
    ];
    expect(moveRoom(frames)).toEqual({ left: 2, right: 5, up: 0 });
  });

  it("makes room above for hops and none below for sinks", () => {
    const frames = [
      { pose: "default", hold: 1, y: 3 },
      { pose: "default", hold: 1, y: -4 }
    ];
    expect(moveRoom(frames).up).toBe(3);
  });
});

describe("encodeMoveGif", () => {
  const doc: MascotDoc = {
    id: "m_test",
    name: "Test",
    version: 1,
    grid: { w: 2, h: 2 },
    tick: 100,
    palette: ["#000000"],
    poses: { default: "0000" },
    sequences: {
      roam: [
        { pose: "default", hold: 1, x: -1 },
        { pose: "default", hold: 1, x: 2, y: 1 },
        { pose: "default", hold: 1, y: -2 }
      ]
    },
    triggers: {}
  };

  it("sizes the GIF to the grid plus the move's own slides and hops", async () => {
    const bytes = new Uint8Array(await encodeMoveGif(doc, "roam", 4).arrayBuffer());
    const width = bytes[6]! | (bytes[7]! << 8);
    const height = bytes[8]! | (bytes[9]! << 8);
    expect([width, height]).toEqual([(2 + 1 + 2) * 4, (2 + 1) * 4]);
  });
});

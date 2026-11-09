import type { MascotFrame } from "./types";

import { describe, expect, it } from "vitest";

import { frameShift } from "./renderer";

const at = (x?: number, y?: number) => frameShift({ pose: "default", hold: 1, x, y }, 8);

describe("frameShift", () => {
  it("leaves the resting mascot where it is", () => {
    expect(at()).toEqual({ dx: 0, dy: 0, sink: 0 });
  });

  it("slides right for +x and left for -x", () => {
    expect(at(24).dx).toBe(192);
    expect(at(-24).dx).toBe(-192);
  });

  it("hops up for +y by moving the canvas, not the drawing", () => {
    expect(at(0, 16)).toEqual({ dx: 0, dy: -128, sink: 0 });
  });

  it("sinks for -y by drawing lower inside the canvas, where the floor cuts it off", () => {
    expect(at(0, -2)).toEqual({ dx: 0, dy: 0, sink: 16 });
  });

  it("moves in whole cells", () => {
    expect(at(1.4, -1.6)).toEqual({ dx: 8, dy: 0, sink: 16 });
  });

  it("treats values that aren't finite numbers as no move", () => {
    expect(at(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({ dx: 0, dy: 0, sink: 0 });
    const bad = { pose: "default", hold: 1, x: "3", y: null } as unknown as MascotFrame;
    expect(frameShift(bad, 8)).toEqual({ dx: 0, dy: 0, sink: 0 });
  });
});

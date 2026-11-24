import type { MascotFrame } from "./types";

import { describe, expect, it } from "vitest";

import { MAX_HOLD, holdTicks, sequenceTicks } from "./format";

describe("holdTicks", () => {
  it("counts whole ticks", () => {
    expect(holdTicks({ pose: "a", hold: 3 })).toBe(3);
    expect(holdTicks({ pose: "a", hold: 2.9 })).toBe(2);
  });

  it("counts anything below one, or not a number, as one tick", () => {
    expect(holdTicks({ pose: "a", hold: 0 })).toBe(1);
    expect(holdTicks({ pose: "a", hold: -4 })).toBe(1);
    expect(holdTicks({ pose: "a", hold: Number.NaN })).toBe(1);
    expect(holdTicks({ pose: "a" } as MascotFrame)).toBe(1);
    expect(holdTicks(undefined)).toBe(1);
  });
});

describe("holdTicks at the top end", () => {
  it("caps a step at MAX_HOLD ticks", () => {
    expect(MAX_HOLD).toBe(120);
    expect(holdTicks({ pose: "a", hold: 120 })).toBe(120);
    expect(holdTicks({ pose: "a", hold: 121 })).toBe(120);
    expect(holdTicks({ pose: "a", hold: 1e9 })).toBe(120);
  });

  it("caps an infinite hold instead of expanding it forever", () => {
    expect(holdTicks({ pose: "a", hold: Number.POSITIVE_INFINITY })).toBe(120);
    expect(holdTicks({ pose: "a", hold: Number.NEGATIVE_INFINITY })).toBe(1);
  });
});

describe("sequenceTicks", () => {
  it("adds up every step's ticks", () => {
    expect(sequenceTicks([])).toBe(0);
    expect(
      sequenceTicks([
        { pose: "a", hold: 2 },
        { pose: "b", hold: 0 },
        { pose: "c", hold: 3 }
      ])
    ).toBe(6);
  });
});

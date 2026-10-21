import type { MascotDoc } from "./types";

import { describe, expect, it } from "vitest";

import { Animator, expandSequence } from "./animator";

const doc = (overrides: Partial<MascotDoc> = {}): MascotDoc => ({
  id: "m_test",
  name: "Test",
  version: 1,
  grid: { w: 2, h: 2 },
  tick: 60,
  palette: ["#000000"],
  poses: { default: "....", up: "0..." },
  sequences: {
    blink: [{ pose: "default", hold: 2 }],
    jump: [
      { pose: "up", hold: 1 },
      { pose: "default", hold: 1 }
    ]
  },
  triggers: { click: "jump" },
  ...overrides
});

describe("expandSequence", () => {
  it("repeats each frame `hold` times", () => {
    expect(expandSequence([{ pose: "a", hold: 3 }])).toHaveLength(3);
  });

  it("treats a missing or zero hold as one tick", () => {
    expect(expandSequence([{ pose: "a", hold: 0 }])).toHaveLength(1);
    expect(expandSequence(undefined)).toEqual([]);
  });
});

describe("Animator", () => {
  it("rests on the default pose until something plays", () => {
    const a = new Animator();
    a.load(doc());
    expect(a.index).toBe(-1);
    expect(a.frame.pose).toBe("default");
    expect(a.busy).toBe(false);
  });

  it("plays a sequence from its first frame and reports busy", () => {
    const a = new Animator();
    a.load(doc());
    expect(a.play("jump")).toBe(true);
    expect(a.frame.pose).toBe("up");
    expect(a.busy).toBe(true);
  });

  it("refuses unknown or empty sequences", () => {
    const a = new Animator();
    a.load(doc({ sequences: { blink: [{ pose: "default", hold: 1 }], empty: [] } }));
    expect(a.play("nope")).toBe(false);
    expect(a.play("empty")).toBe(false);
    expect(a.current).toBeNull();
  });

  it("plays a sequence once, then rests on the default pose", () => {
    const a = new Animator();
    a.load(doc());
    a.play("jump");
    a.advance();
    expect(a.current).toBe("jump");
    a.advance();
    expect(a.current).toBeNull();
    expect(a.index).toBe(-1);
    expect(a.frame.pose).toBe("default");
    expect(a.busy).toBe(false);
  });

  it("does not loop a sequence by itself", () => {
    const a = new Animator();
    a.load(doc());
    a.play("blink");
    a.advance();
    a.advance();
    a.advance();
    expect(a.current).toBeNull();
    expect(a.index).toBe(-1);
  });

  it("seeks within bounds", () => {
    const a = new Animator();
    a.load(doc());
    a.seek("jump", 99);
    expect(a.index).toBe(1);
    a.seek("jump", -5);
    expect(a.index).toBe(0);
  });

  it("keeps the current sequence across a reload, clamping the index", () => {
    const a = new Animator();
    a.load(doc());
    a.seek("jump", 1);
    const lost = a.load(
      doc({ sequences: { blink: [{ pose: "default", hold: 1 }], jump: [{ pose: "up", hold: 1 }] } })
    );
    expect(lost).toBe(false);
    expect(a.current).toBe("jump");
    expect(a.index).toBe(0);
  });

  it("reports when the playing sequence is deleted", () => {
    const a = new Animator();
    a.load(doc());
    a.play("jump");
    const lost = a.load(doc({ sequences: { blink: [{ pose: "default", hold: 1 }] } }));
    expect(lost).toBe(true);
    expect(a.current).toBeNull();
    expect(a.index).toBe(-1);
  });
});

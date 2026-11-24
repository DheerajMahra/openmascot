import type { MascotDoc } from "./types";

import { describe, expect, it } from "vitest";

import { parseMascotDoc } from "./parse";

const doc: MascotDoc = {
  id: "m_test",
  name: "Testy",
  version: 1,
  grid: { w: 2, h: 2 },
  tick: 80,
  palette: ["#000000"],
  poses: { default: "0..0" },
  sequences: { wave: [{ pose: "default", hold: 2 }] },
  triggers: { click: "wave" }
};

describe("parseMascotDoc", () => {
  it("returns a valid doc as it was", () => {
    expect(parseMascotDoc(doc)).toEqual(doc);
  });

  it("rejects values that can't be drawn", () => {
    for (const value of [
      null,
      "doc",
      [],
      { ...doc, id: 7 },
      { ...doc, grid: undefined },
      { ...doc, grid: { w: 0, h: 16 } },
      { ...doc, grid: { w: 2.5, h: 16 } },
      { ...doc, palette: "#000000" },
      { ...doc, palette: [1] },
      { ...doc, poses: { default: 3 } },
      { ...doc, poses: undefined }
    ]) {
      expect(parseMascotDoc(value)).toBeNull();
    }
  });

  it("fills in what a hand-written file leaves out", () => {
    const {
      name: _name,
      version: _version,
      tick: _tick,
      sequences: _s,
      triggers: _t,
      ...bare
    } = doc;
    expect(parseMascotDoc(bare)).toEqual({
      ...bare,
      name: "",
      version: 1,
      tick: 60,
      sequences: {},
      triggers: {}
    });
    expect(parseMascotDoc({ ...doc, tick: -1 })?.tick).toBe(60);
    expect(parseMascotDoc({ ...doc, tick: Number.POSITIVE_INFINITY })?.tick).toBe(60);
  });

  it("drops moves that aren't lists of frames and triggers that don't name a move", () => {
    const parsed = parseMascotDoc({
      ...doc,
      sequences: { ...doc.sequences, broken: "wave", odd: [{ hold: 2 }] },
      triggers: { ...doc.triggers, hover: 3 }
    });
    expect(parsed?.sequences).toEqual(doc.sequences);
    expect(parsed?.triggers).toEqual(doc.triggers);
  });

  it("drops the idle trigger older docs carry", () => {
    expect(parseMascotDoc({ ...doc, triggers: { idle: "wave", click: "wave" } })?.triggers).toEqual(
      { click: "wave" }
    );
  });

  it("keeps a move and a trigger named __proto__ as ordinary entries", () => {
    // JSON.parse makes "__proto__" an own key, the way a fetched or stored file arrives.
    const parsed = parseMascotDoc(
      JSON.parse(
        JSON.stringify({ ...doc, triggers: { click: "wave" } })
          .replace('"wave":[', '"__proto__":[')
          .replace('"click":"wave"', '"click":"__proto__","__proto__":"x"')
      )
    );
    expect(Object.keys(parsed?.sequences ?? {})).toEqual(["__proto__"]);
    expect(Object.getPrototypeOf(parsed?.sequences)).toBe(Object.prototype);
    expect(Object.keys(parsed?.triggers ?? {})).toEqual(["click", "__proto__"]);
  });

  it("keeps fields it doesn't know, so newer files survive a round trip", () => {
    expect(parseMascotDoc({ ...doc, author: "dee" })).toMatchObject({ author: "dee" });
  });

  it("never changes the value it was given", () => {
    const input = { ...doc, triggers: { idle: "wave" } };
    parseMascotDoc(input);
    expect(input.triggers).toEqual({ idle: "wave" });
  });
});

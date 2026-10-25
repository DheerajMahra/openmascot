import { describe, expect, it } from "vitest";

import { SAMPLES, isStartFrom, startDoc } from "@/lib/samples";

describe("starting points", () => {
  it("knows blank and every sample", () => {
    expect(isStartFrom("blank")).toBe(true);
    for (const sample of SAMPLES) expect(isStartFrom(sample.key)).toBe(true);
    expect(isStartFrom("nope")).toBe(false);
    expect(isStartFrom(undefined)).toBe(false);
    expect(isStartFrom(["blank"])).toBe(false);
  });

  it("makes a blank mascot with the given id", () => {
    const doc = startDoc("blank", "m_new");
    expect(doc.id).toBe("m_new");
    expect(doc.name).toBe("Untitled");
  });

  it("copies a sample under the given id, leaving the sample untouched", () => {
    const sample = SAMPLES[0];
    if (!sample) throw new Error("no samples");
    const before = structuredClone(sample.doc);
    const doc = startDoc(sample.key, "m_copy");

    expect(doc.id).toBe("m_copy");
    expect(doc.name).toBe(sample.doc.name);
    doc.poses["default"] = "changed";
    expect(sample.doc).toEqual(before);
  });
});

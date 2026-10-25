import { describe, expect, it } from "vitest";

import { STEPS, stepHref, stepIndex } from "@/lib/steps";

const [make, animate, share] = STEPS;

describe("step links", () => {
  it("point at the open mascot", () => {
    expect(stepHref(animate, "m_abc12", null)).toBe("/animate/m_abc12");
    expect(stepHref(share, "m_abc12", null)).toBe("/share/m_abc12");
  });

  it("keep a draft's starting point, so a reload rebuilds the same draft", () => {
    expect(stepHref(make, "m_abc12", "clawd")).toBe("/make/m_abc12?from=clawd");
  });
});

describe("current step", () => {
  it("is found from a path with a mascot id", () => {
    expect(stepIndex("/make/m_abc12")).toBe(0);
    expect(stepIndex("/animate/m_abc12")).toBe(1);
    expect(stepIndex("/share/m_abc12")).toBe(2);
  });
});

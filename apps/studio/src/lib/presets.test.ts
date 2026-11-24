import { describe, expect, it } from "vitest";

import { buildTrigger, shortTrigger, triggerParts, uniqueTrigger } from "@/lib/presets";

describe("triggerParts", () => {
  it("splits a key into its kind and detail", () => {
    expect(triggerParts("click")).toEqual({ kind: "click", param: "" });
    expect(triggerParts("interval:9")).toEqual({ kind: "interval", param: "9" });
    expect(triggerParts("custom:win")).toEqual({ kind: "custom", param: "win" });
    expect(triggerParts("idle")).toEqual({ kind: null, param: "" });
  });

  it("reads a bad interval the way the runtime plays it", () => {
    expect(triggerParts("interval:abc")).toEqual({ kind: "interval", param: "5" });
    expect(shortTrigger("interval:abc")).toBe("every 5 s");
  });
});

describe("buildTrigger", () => {
  it("fills an empty detail with the default", () => {
    expect(buildTrigger("interval", "")).toBe("interval:6");
    expect(buildTrigger("custom", "")).toBe("custom:success");
    expect(buildTrigger("hover", "")).toBe("hover");
  });

  it("round-trips through triggerParts", () => {
    for (const key of ["load", "interval:12", "custom:saved"]) {
      const { kind, param } = triggerParts(key);
      expect(kind && buildTrigger(kind, param)).toBe(key);
    }
  });
});

describe("uniqueTrigger", () => {
  it("bumps a taken default", () => {
    expect(uniqueTrigger("custom", { "custom:success": "a" })).toBe("custom:success-2");
    expect(uniqueTrigger("interval", { "interval:6": "a", "interval:7": "b" })).toBe("interval:8");
  });
});

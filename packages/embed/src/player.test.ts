import type { MascotDoc } from "./types";

// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MascotPlayer } from "./player";

const doc: MascotDoc = {
  id: "m_test",
  name: "Testy",
  version: 1,
  grid: { w: 2, h: 2 },
  tick: 60,
  palette: ["#000000"],
  poses: { default: "0..0" },
  sequences: { wave: [{ pose: "default", hold: 1 }], hop: [{ pose: "default", hold: 1 }] },
  triggers: {}
};

const mount = (start: MascotDoc, triggers = true) => {
  const el = document.createElement("div");
  document.body.append(el);
  const player = new MascotPlayer(el, start, { triggers, reducedMotion: false });
  return { el, player, play: vi.spyOn(player, "play") };
};

beforeAll(() => {
  // jsdom has no canvas. The renderer only needs pixel buffers and calls that do nothing.
  const ctx = new Proxy(
    { createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }) },
    { get: (target, prop) => (prop in target ? target[prop as "createImageData"] : () => {}) }
  );
  HTMLCanvasElement.prototype.getContext = (() =>
    ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

describe("MascotPlayer triggers", () => {
  it("wires triggers a later doc adds, and drops the ones it removes", () => {
    const { el, player, play } = mount(doc);
    el.click();
    expect(play).not.toHaveBeenCalled();

    player.setDoc({ ...doc, triggers: { click: "wave" } });
    el.click();
    expect(play).toHaveBeenLastCalledWith("wave");
    expect(el.style.cursor).toBe("pointer");

    player.setDoc({ ...doc, triggers: { click: "hop" } });
    el.click();
    expect(play).toHaveBeenLastCalledWith("hop");
    expect(play).toHaveBeenCalledTimes(2);

    player.setDoc(doc);
    el.click();
    expect(play).toHaveBeenCalledTimes(2);
    expect(el.style.cursor).toBe("");
  });

  it("keeps an interval running across edits that leave the triggers alone", () => {
    const { player, play } = mount({ ...doc, triggers: { "interval:1": "wave" } });
    vi.advanceTimersByTime(600);
    player.setDoc({ ...doc, name: "Renamed", triggers: { "interval:1": "wave" } });
    vi.advanceTimersByTime(400);
    expect(play).toHaveBeenCalledWith("wave");
  });

  it("plays the load move once, on mount, not on later doc swaps", () => {
    const { player, play } = mount({ ...doc, triggers: { load: "wave" } });
    expect(player.current).toBe("wave");
    player.setDoc({ ...doc, triggers: { load: "hop" } });
    expect(play).not.toHaveBeenCalled();
  });

  it("never wires triggers when they are turned off", () => {
    const { el, player, play } = mount({ ...doc, triggers: { click: "wave" } }, false);
    player.setDoc({ ...doc, triggers: { click: "hop" } });
    el.click();
    expect(play).not.toHaveBeenCalled();
  });

  it("keeps an interval running when the same triggers arrive in a different order", () => {
    const { player, play } = mount({ ...doc, triggers: { click: "hop", "interval:1": "wave" } });
    vi.advanceTimersByTime(600);
    player.setDoc({ ...doc, triggers: { "interval:1": "wave", click: "hop" } });
    vi.advanceTimersByTime(400);
    expect(play).toHaveBeenCalledWith("wave");
  });

  it("rewires when the trigger map is changed in place and passed again", () => {
    const triggers: Record<string, string> = { click: "wave" };
    const { el, player, play } = mount({ ...doc, triggers });
    triggers.click = "hop";
    player.setDoc({ ...doc, triggers });
    el.click();
    expect(play).toHaveBeenLastCalledWith("hop");
  });

  it("ignores a doc passed after it was destroyed", () => {
    const { el, player, play } = mount(doc);
    player.destroy();
    player.setDoc({ ...doc, triggers: { click: "wave", "interval:1": "hop" } });
    el.click();
    vi.advanceTimersByTime(2000);
    expect(play).not.toHaveBeenCalled();
    expect(el.querySelector("canvas")).toBeNull();
  });

  it("removes its listeners when destroyed", () => {
    const { el, player, play } = mount({ ...doc, triggers: { click: "wave" } });
    player.destroy();
    el.click();
    expect(play).not.toHaveBeenCalled();
  });
});

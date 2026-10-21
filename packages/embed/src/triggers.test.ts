import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TriggerManager, parseTrigger, type TriggerHost } from "./triggers";

describe("parseTrigger", () => {
  it("parses the plain events", () => {
    for (const key of ["load", "click", "hover"] as const) {
      expect(parseTrigger(key)).toEqual({ type: key });
    }
  });

  it("parses intervals, defaulting a bad number to 5 seconds", () => {
    expect(parseTrigger("interval:30")).toEqual({ type: "interval", seconds: 30 });
    expect(parseTrigger("interval:abc")).toEqual({ type: "interval", seconds: 5 });
  });

  it("parses custom events and rejects unknown keys", () => {
    expect(parseTrigger("custom:win")).toEqual({ type: "custom", name: "win" });
    expect(parseTrigger("nope")).toBeNull();
    expect(parseTrigger("idle")).toBeNull();
  });
});

type Listener = () => void;

const makeHost = (busy = false) => {
  const listeners = new Map<string, Listener>();
  const el = {
    style: { cursor: "" },
    addEventListener: (type: string, fn: Listener) => void listeners.set(type, fn),
    removeEventListener: (type: string) => void listeners.delete(type)
  };
  const play = vi.fn(() => true);
  const host = { el, play, isBusy: () => busy } as unknown as TriggerHost;
  return { host, el, play, listeners };
};

describe("TriggerManager", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays the sequence on click and shows a pointer cursor", () => {
    const { host, el, play, listeners } = makeHost();
    new TriggerManager(host, { click: "jump" }).attach();
    expect(el.style.cursor).toBe("pointer");
    listeners.get("click")?.();
    expect(play).toHaveBeenCalledWith("jump");
  });

  it("does not interrupt a busy mascot on hover", () => {
    const { host, play, listeners } = makeHost(true);
    new TriggerManager(host, { hover: "wave" }).attach();
    listeners.get("mouseenter")?.();
    expect(play).not.toHaveBeenCalled();
  });

  it("fires intervals only while nothing is playing", () => {
    const { host, play } = makeHost();
    new TriggerManager(host, { "interval:2": "wave" }).attach();
    vi.advanceTimersByTime(4000);
    expect(play).toHaveBeenCalledTimes(2);

    const busy = makeHost(true);
    new TriggerManager(busy.host, { "interval:2": "wave" }).attach();
    vi.advanceTimersByTime(4000);
    expect(busy.play).not.toHaveBeenCalled();
  });

  it("detach removes listeners and stops intervals", () => {
    const { host, el, play, listeners } = makeHost();
    const m = new TriggerManager(host, { click: "jump", "interval:1": "wave" });
    m.attach();
    m.detach();
    expect(listeners.size).toBe(0);
    expect(el.style.cursor).toBe("");
    vi.advanceTimersByTime(5000);
    expect(play).not.toHaveBeenCalled();
  });

  it("leaves load and custom triggers to the player", () => {
    const { host, listeners } = makeHost();
    new TriggerManager(host, { load: "hi", "custom:win": "cheer" }).attach();
    expect(listeners.size).toBe(0);
  });
});

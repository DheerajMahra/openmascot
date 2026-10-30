import type { MascotElement } from "./element";
import type { MascotDoc } from "./types";

// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { defineMascotElement, emit, play } from "./element";

const doc: MascotDoc = {
  id: "m_test",
  name: "Testy",
  version: 1,
  grid: { w: 2, h: 2 },
  tick: 60,
  palette: ["#000000"],
  poses: { idle: "0..0" },
  sequences: { wave: [{ pose: "idle", hold: 1 }], cheer: [{ pose: "idle", hold: 1 }] },
  triggers: { "custom:success": "cheer" }
};

const create = (attrs: Record<string, string> = {}, withDoc = true): MascotElement => {
  const el = document.createElement("open-mascot");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (withDoc) el.doc = doc;
  document.body.append(el);
  return el;
};

const respond = (body: unknown) =>
  vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }));

beforeAll(() => {
  // jsdom has no canvas. The renderer only needs pixel buffers and calls that do nothing.
  const ctx = new Proxy(
    { createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }) },
    { get: (target, prop) => (prop in target ? target[prop as "createImageData"] : () => {}) }
  );
  HTMLCanvasElement.prototype.getContext = (() =>
    ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  defineMascotElement();
});

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("<open-mascot>", () => {
  it("mounts a canvas when it enters the page and cleans up when it leaves", () => {
    const el = create();
    expect(el.player).not.toBeNull();
    expect(el.querySelector("canvas")).toBe(el.player?.canvas);

    el.remove();
    expect(el.player).toBeNull();
    expect(el.querySelector("canvas")).toBeNull();
  });

  it("loads src when no doc is given, and drops a load that lands after it left", async () => {
    const fetch = respond(doc);
    vi.stubGlobal("fetch", fetch);

    const kept = create({ src: "/a.json" }, false);
    const gone = create({ src: "/b.json" }, false);
    gone.remove();
    await vi.waitFor(() => expect(kept.player).not.toBeNull());

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(gone.player).toBeNull();
  });

  it("does not fetch again when moved within the page", async () => {
    const fetch = respond(doc);
    vi.stubGlobal("fetch", fetch);
    const el = create({ src: "/a.json" }, false);
    await vi.waitFor(() => expect(el.player).not.toBeNull());

    document.body.prepend(el);
    expect(el.player).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("resizes in place on a scale change", () => {
    const el = create({ scale: "2" });
    const player = el.player;
    const width = player?.canvas.width ?? 0;
    el.scale = 6;
    expect(el.player).toBe(player);
    expect(player?.canvas.width).toBe(width * 3);
  });

  it("pins to a corner and lets go when the position goes", () => {
    const el = create({ position: "bottom-left" });
    expect(el.style.position).toBe("fixed");
    el.position = null;
    expect(el.style.position).toBe("");
  });

  it("picks up a doc set before the element was defined", () => {
    // Before definition, an assignment lands as an own property that hides the setter.
    const el = document.createElement("open-mascot");
    Object.defineProperty(el, "doc", { value: doc, configurable: true, writable: true });
    document.body.append(el);
    expect(el.player).not.toBeNull();
    expect(el.doc).toBe(doc);
  });
});

describe("emit and play", () => {
  it("reach every mascot without a target", () => {
    const a = create();
    const b = create();
    expect(emit("success")).toBe(true);
    expect(a.player?.current).toBe("cheer");
    expect(b.player?.current).toBe("cheer");
  });

  it("reach only the named mascot with `to`", () => {
    const guide = create({ name: "guide" });
    const inbox = create({ name: "inbox" });
    expect(play("wave", { to: "inbox" })).toBe(true);
    expect(inbox.player?.current).toBe("wave");
    expect(guide.player?.current).toBeNull();
  });

  it("return false when nothing played", () => {
    create({ name: "guide" });
    expect(emit("success", { to: "nobody" })).toBe(false);
    expect(play("missing")).toBe(false);
  });
});

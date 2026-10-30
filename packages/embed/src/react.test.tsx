import type { MascotElement } from "./element";
import type { MascotDoc } from "./types";

// @vitest-environment jsdom
import { act, createRef } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Mascot, emit } from "./react";

const doc: MascotDoc = {
  id: "m_test",
  name: "Testy",
  version: 1,
  grid: { w: 2, h: 2 },
  tick: 60,
  palette: ["#000000"],
  poses: { idle: "0..0" },
  sequences: { cheer: [{ pose: "idle", hold: 1 }] },
  triggers: { "custom:success": "cheer" }
};

const mascot = (name: string) => document.querySelector<MascotElement>(`open-mascot[name=${name}]`);

beforeAll(() => {
  // React's act() environment flag, and a canvas that does nothing (jsdom has none).
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const ctx = new Proxy(
    { createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }) },
    { get: (target, prop) => (prop in target ? target[prop as "createImageData"] : () => {}) }
  );
  HTMLCanvasElement.prototype.getContext = (() =>
    ctx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => document.body.replaceChildren());

describe("<Mascot>", () => {
  it("mounts from a doc when hydrating server-rendered HTML", async () => {
    const app = <Mascot doc={doc} name="ssr" scale={2} triggers={false} />;
    const root = document.createElement("div");
    root.innerHTML = renderToString(app);
    document.body.append(root);
    expect(mascot("ssr")?.player).toBeNull();

    await act(async () => void hydrateRoot(root, app));
    expect(mascot("ssr")?.player).not.toBeNull();
    expect(mascot("ssr")?.triggers).toBe(false);
    expect(emit("success", { to: "ssr" })).toBe(true);
  });

  it("hands the element to a ref and lets go on unmount", async () => {
    const ref = createRef<MascotElement>();
    const root = createRoot(document.body.appendChild(document.createElement("div")));
    await act(async () => root.render(<Mascot doc={doc} name="ref" ref={ref} />));
    expect(ref.current).toBe(mascot("ref"));
    expect(ref.current?.player).not.toBeNull();

    const el = ref.current;
    await act(async () => root.unmount());
    expect(ref.current).toBeNull();
    expect(el?.player).toBeNull();
  });
});

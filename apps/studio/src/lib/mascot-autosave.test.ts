import type { MascotRepository } from "@/lib/mascot-repository";
import type { MascotStore } from "@/lib/mascot-store";
import type { MascotDoc } from "openmascot";

import { describe, expect, it } from "vitest";

import { createAutosave } from "@/lib/mascot-autosave";
import { createMascotStore } from "@/lib/mascot-store";
import { EMPTY, draftStore, pickColor, setup, stroke } from "@/lib/mascot-test-fixtures";
import { createBlankMascot } from "@/lib/samples";

const undo = (store: MascotStore) => store.dispatch({ type: "undo" });

/** A repository that records what autosave writes. */
const recordingRepo = (): MascotRepository & { saved: MascotDoc[] } => {
  const saved: MascotDoc[] = [];
  return {
    saved,
    list: async () => [],
    get: async () => null,
    save: async doc => {
      saved.push(doc);
    },
    remove: async () => {}
  };
};

describe("autosave", () => {
  it("doesn't save a mascot just because it opened", () => {
    const store = createMascotStore();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    store.dispatch({ type: "open-draft", doc: createBlankMascot(), from: "blank" });
    store.dispatch({ type: "open-saved", doc: createBlankMascot() });
    expect(repo.saved).toEqual([]);
  });

  it("doesn't save a draft that only changed selection, tool or board options", () => {
    const store = draftStore();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    store.dispatch({ type: "set-tool", tool: "fill" });
    store.dispatch({ type: "set-color", index: 2 });
    store.dispatch({ type: "select-seq", name: "bounce" });
    store.dispatch({ type: "set-board-option", option: "centerLines", value: false });
    expect(repo.saved).toEqual([]);
    expect(store.getState().status).toBe("draft");
  });

  it("saves a draft on its first change and promotes it once", () => {
    const store = draftStore();
    const repo = recordingRepo();
    const promoted: string[] = [];
    createAutosave(store, repo, id => promoted.push(id));
    stroke(store, [[0, 0]]);
    expect(store.getState().status).toBe("saved");
    expect(repo.saved).toEqual([store.getState().doc]);
    expect(promoted).toEqual([store.getState().doc.id]);

    stroke(store, [[1, 0]]);
    expect(repo.saved).toHaveLength(2);
    expect(promoted).toHaveLength(1);
  });

  it("doesn't save a draft for gestures that leave it as it was", () => {
    const store = draftStore();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    // Erasing an empty cell, and a color pick that ends on the color it started with.
    stroke(store, [[0, 0]], { ch: EMPTY });
    pickColor(store, 1, ["#d97757"]);
    store.dispatch({ type: "set-name", name: store.getState().doc.name });
    expect(repo.saved).toEqual([]);
    expect(store.getState().status).toBe("draft");
  });

  it("doesn't re-save a saved mascot for a gesture that changes nothing", () => {
    const store = setup();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    stroke(store, [[0, 0]]);
    stroke(store, [[0, 0]]);
    expect(repo.saved).toHaveLength(1);
  });

  it("counts a rename as a change", () => {
    const store = draftStore();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    store.dispatch({ type: "set-name", name: "Pip" });
    expect(repo.saved.map(d => d.name)).toEqual(["Pip"]);
  });

  it("saves every change to a saved mascot, including undoing back to how it opened", () => {
    const store = setup();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    stroke(store, [[0, 0]]);
    undo(store);
    expect(repo.saved).toHaveLength(2);
    expect(repo.saved[1]).toBe(store.getState().doc);
  });

  it("stops saving a mascot once it is closed", () => {
    const store = setup();
    const repo = recordingRepo();
    createAutosave(store, repo, () => {});
    store.dispatch({ type: "close", id: store.getState().doc.id });
    store.dispatch({ type: "set-name", name: "Ghost" });
    expect(repo.saved).toEqual([]);
  });

  it("stops when unsubscribed", () => {
    const store = setup();
    const repo = recordingRepo();
    const stop = createAutosave(store, repo, () => {});
    stop();
    stroke(store, [[0, 0]]);
    expect(repo.saved).toEqual([]);
  });
});

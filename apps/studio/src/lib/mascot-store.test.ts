import type { MascotAction, MascotStore } from "@/lib/mascot-store";

import { describe, expect, it } from "vitest";

import { canRedo, canUndo, createBlankMascot, createMascotStore } from "@/lib/mascot-store";
import { cellAt, colorChar } from "@/lib/pose-utils";

const W = 24;
const INK = colorChar(1);
const EMPTY = ".";

/** A store holding a fresh blank mascot: one blank "default" pose, four colors, one move. */
const setup = (): MascotStore => {
  const store = createMascotStore();
  store.dispatch({ type: "replace-doc", doc: createBlankMascot() });
  return store;
};

/** A drag across cells, sent the way the pixelboard sends it: the first cell opens the step. */
const stroke = (
  store: MascotStore,
  cells: [number, number][],
  { pose = "default", ch = INK, mirror = false } = {}
) =>
  cells.forEach(([x, y], i) =>
    store.dispatch({ type: "paint-cell", pose, x, y, ch, commit: i === 0, mirror })
  );

/** One color-picker drag on an existing swatch, tick by tick. */
const pickColor = (store: MascotStore, index: number, hexes: string[]) =>
  hexes.forEach((hex, i) => store.dispatch({ type: "set-palette", index, hex, commit: i === 0 }));

/** Adding a swatch the way the palette picker does: the first tick adds it, the rest tune it. */
const addColor = (store: MascotStore, hexes: string[]) => {
  const [first, ...rest] = hexes;
  store.dispatch({ type: "add-color", hex: first ?? "#000000" });
  const index = store.getState().doc.palette.length - 1;
  for (const hex of rest) store.dispatch({ type: "set-palette", index, hex, commit: false });
};

const undo = (store: MascotStore) => store.dispatch({ type: "undo" });
const redo = (store: MascotStore) => store.dispatch({ type: "redo" });

/** Undoes until nothing is left; returns how many steps there were. */
const undoAll = (store: MascotStore): number => {
  let n = 0;
  while (canUndo(store.getState())) {
    undo(store);
    n++;
  }
  return n;
};

const redoAll = (store: MascotStore): number => {
  let n = 0;
  while (canRedo(store.getState())) {
    redo(store);
    n++;
  }
  return n;
};

const pose = (store: MascotStore, name = "default"): string =>
  store.getState().doc.poses[name] ?? "";
const cell = (store: MascotStore, x: number, y: number, name = "default"): string =>
  cellAt(pose(store, name), W, x, y);
const steps = (store: MascotStore) => ({
  undo: canUndo(store.getState()),
  redo: canRedo(store.getState())
});

/** A store with one step to undo and one to redo. */
const withBothStacks = (): MascotStore => {
  const store = setup();
  stroke(store, [[0, 0]]);
  stroke(store, [[1, 0]]);
  undo(store);
  expect(steps(store)).toEqual({ undo: true, redo: true });
  return store;
};

describe("undo: drawing", () => {
  it("makes one step per stroke, and undo and redo restore it exactly", () => {
    const store = setup();
    const before = pose(store);
    stroke(store, [
      [0, 0],
      [1, 0],
      [2, 0]
    ]);
    const after = pose(store);
    expect([cell(store, 0, 0), cell(store, 1, 0), cell(store, 2, 0)]).toEqual([INK, INK, INK]);

    undo(store);
    expect(pose(store)).toBe(before);
    expect(steps(store)).toEqual({ undo: false, redo: true });

    redo(store);
    expect(pose(store)).toBe(after);
    expect(steps(store)).toEqual({ undo: true, redo: false });
  });

  it("keeps separate strokes as separate steps", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    stroke(store, [[1, 0]]);

    undo(store);
    expect([cell(store, 0, 0), cell(store, 1, 0)]).toEqual([INK, EMPTY]);
    expect(undoAll(store)).toBe(1);
  });

  it("paints both sides of a mirror stroke in one step", () => {
    const store = setup();
    stroke(store, [[0, 0]], { mirror: true });
    expect([cell(store, 0, 0), cell(store, W - 1, 0)]).toEqual([INK, INK]);

    undo(store);
    expect([cell(store, 0, 0), cell(store, W - 1, 0)]).toEqual([EMPTY, EMPTY]);
    expect(steps(store).undo).toBe(false);
  });

  it("treats erasing as drawing", () => {
    const store = setup();
    stroke(store, [[3, 3]]);
    stroke(store, [[3, 3]], { ch: EMPTY });
    expect(cell(store, 3, 3)).toBe(EMPTY);

    undo(store);
    expect(cell(store, 3, 3)).toBe(INK);
  });

  it("adds no step for a stroke that changes nothing, and keeps redo", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    undo(store);

    // Erasing cells that are already empty.
    stroke(
      store,
      [
        [5, 5],
        [6, 5]
      ],
      { ch: EMPTY }
    );
    expect(steps(store)).toEqual({ undo: false, redo: true });

    redo(store);
    expect(cell(store, 0, 0)).toBe(INK);
  });

  it("skips a click that changed nothing when undoing", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    stroke(store, [[0, 0]]); // already that color

    expect(steps(store).undo).toBe(true);
    undo(store);
    expect(cell(store, 0, 0)).toBe(EMPTY);
    expect(steps(store).undo).toBe(false);
  });

  it("makes one step for a fill, and none for a fill that changes nothing", () => {
    const store = setup();
    const blank = pose(store);
    store.dispatch({ type: "fill-cell", pose: "default", x: 0, y: 0, ch: INK });
    store.dispatch({ type: "fill-cell", pose: "default", x: 5, y: 5, ch: INK });
    expect(pose(store)).toBe(INK.repeat(blank.length));

    expect(undoAll(store)).toBe(1);
    expect(pose(store)).toBe(blank);
  });

  it("makes Clear undoable, and adds no step when the pose is already blank", () => {
    const store = setup();
    stroke(store, [[2, 2]]);
    const drawn = pose(store);

    store.dispatch({ type: "clear-pose", name: "default" });
    store.dispatch({ type: "clear-pose", name: "default" });
    expect(cell(store, 2, 2)).toBe(EMPTY);

    undo(store);
    expect(pose(store)).toBe(drawn);
  });

  it("makes Reset undoable, and adds no step when the pose already matches default", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    store.dispatch({ type: "add-pose", name: "wave" });
    stroke(store, [[1, 1]], { pose: "wave" });
    const edited = pose(store, "wave");

    store.dispatch({ type: "reset-pose", name: "wave" });
    store.dispatch({ type: "reset-pose", name: "wave" });
    expect(pose(store, "wave")).toBe(pose(store, "default"));

    undo(store);
    expect(pose(store, "wave")).toBe(edited);
  });

  it("drops redo once a new edit is made", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    undo(store);
    stroke(store, [[1, 0]]);

    expect(steps(store).redo).toBe(false);
  });

  it("keeps the latest 50 steps in undo and in redo", () => {
    const store = setup();
    for (let i = 0; i < 60; i++) stroke(store, [[0, 0]], { ch: i % 2 ? EMPTY : INK });

    expect(undoAll(store)).toBe(50);
    // Back to just after stroke 10, an erase.
    expect(cell(store, 0, 0)).toBe(EMPTY);
    expect(redoAll(store)).toBe(50);
  });
});

describe("undo: palette", () => {
  it("makes one step for a whole color drag on an existing swatch", () => {
    const store = setup();
    const original = store.getState().doc.palette[2];
    pickColor(store, 2, ["#aa0000", "#bb0000", "#cc0000"]);

    undo(store);
    expect(store.getState().doc.palette[2]).toBe(original);
    expect(steps(store).undo).toBe(false);

    redo(store);
    expect(store.getState().doc.palette[2]).toBe("#cc0000");
  });

  it("adds no step for a drag that ends on the color it started from", () => {
    const store = setup();
    const original = store.getState().doc.palette[2] ?? "";
    pickColor(store, 2, ["#00aa00", original]);

    expect(steps(store).undo).toBe(false);
  });

  it("records a drag whose first tick is the swatch's current color", () => {
    const store = setup();
    const original = store.getState().doc.palette[2] ?? "";
    pickColor(store, 2, [original, "#0000cc"]);

    undo(store);
    expect(store.getState().doc.palette[2]).toBe(original);
  });

  it("doesn't undo adding a color, or tuning it before the pick ends", () => {
    const store = setup();
    addColor(store, ["#101010", "#336699"]);

    const { doc, colorIndex } = store.getState();
    expect(doc.palette).toHaveLength(5);
    expect(doc.palette[4]).toBe("#336699");
    expect(colorIndex).toBe(4);
    expect(steps(store).undo).toBe(false);
  });

  it("keeps an added color when undoing a stroke painted with it", () => {
    const store = setup();
    addColor(store, ["#336699"]);
    stroke(store, [[0, 0]], { ch: colorChar(4) });

    undo(store);
    expect(cell(store, 0, 0)).toBe(EMPTY);
    expect(store.getState().doc.palette).toHaveLength(5);
    expect(store.getState().colorIndex).toBe(4);
  });

  it("doesn't fold a new color's ticks into an earlier color step", () => {
    const store = setup();
    const original = store.getState().doc.palette[2];
    pickColor(store, 2, ["#aa0000"]);
    addColor(store, ["#101010", "#202020"]);

    undo(store);
    expect(store.getState().doc.palette[2]).toBe(original);
    expect(store.getState().doc.palette[4]).toBe("#202020");
    expect(steps(store).undo).toBe(false);

    redo(store);
    expect(store.getState().doc.palette[2]).toBe("#aa0000");
  });
});

describe("undo: deliberate actions are not undoable", () => {
  /** Each action, plus any setup it needs. `changesDoc` guards against a case passing because it did nothing. */
  const cases: {
    name: string;
    prepare?: MascotAction[];
    action: MascotAction;
    changesDoc: boolean;
  }[] = [
    { name: "add a color", action: { type: "add-color", hex: "#abcdef" }, changesDoc: true },
    { name: "add a pose", action: { type: "add-pose" }, changesDoc: true },
    { name: "rename the mascot", action: { type: "set-name", name: "Blob" }, changesDoc: true },
    { name: "add a move", action: { type: "add-seq", name: "wave" }, changesDoc: true },
    {
      name: "rename a move",
      action: { type: "rename-seq", from: "move", to: "hop" },
      changesDoc: true
    },
    {
      name: "delete a move",
      prepare: [{ type: "add-seq", name: "wave" }],
      action: { type: "delete-seq", name: "wave" },
      changesDoc: true
    },
    {
      name: "change a frame",
      action: { type: "set-frame", seq: "move", index: 0, frame: { hold: 9 } },
      changesDoc: true
    },
    { name: "add a frame", action: { type: "add-frame", seq: "move" }, changesDoc: true },
    {
      name: "remove a frame",
      prepare: [{ type: "add-frame", seq: "move" }],
      action: { type: "remove-frame", seq: "move", index: 1 },
      changesDoc: true
    },
    {
      name: "move a frame",
      prepare: [{ type: "add-frame", seq: "move", frame: { pose: "default", hold: 9 } }],
      action: { type: "move-frame", seq: "move", index: 0, dir: 1 },
      changesDoc: true
    },
    {
      name: "reorder a frame",
      prepare: [{ type: "add-frame", seq: "move", frame: { pose: "default", hold: 9 } }],
      action: { type: "reorder-frame", seq: "move", from: 0, to: 1 },
      changesDoc: true
    },
    { name: "add a trigger", action: { type: "add-trigger", seq: "move" }, changesDoc: true },
    {
      name: "change a trigger",
      prepare: [{ type: "add-trigger", seq: "move" }],
      action: { type: "replace-trigger", from: "click", to: "hover", seq: "move" },
      changesDoc: true
    },
    {
      name: "remove a trigger",
      prepare: [{ type: "add-trigger", seq: "move" }],
      action: { type: "remove-trigger", key: "click" },
      changesDoc: true
    },
    { name: "pick a tool", action: { type: "set-tool", tool: "fill" }, changesDoc: false },
    { name: "pick a color", action: { type: "set-color", index: 2 }, changesDoc: false },
    {
      name: "toggle a board option",
      action: { type: "set-board-option", option: "centerLines", value: false },
      changesDoc: false
    }
  ];

  it.each(cases)(
    "$name: leaves undo and redo untouched",
    ({ prepare = [], action, changesDoc }) => {
      const store = setup();
      stroke(store, [[0, 0]]);
      stroke(store, [[1, 0]]);
      undo(store);
      for (const a of prepare) store.dispatch(a);
      const { doc, history, future } = store.getState();

      store.dispatch(action);

      const next = store.getState();
      expect(next.doc !== doc).toBe(changesDoc);
      expect(next.history).toBe(history);
      expect(next.future).toBe(future);
    }
  );

  it("never reverses them when undoing everything", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    store.dispatch({ type: "set-name", name: "Blob" });
    store.dispatch({ type: "add-frame", seq: "move" });
    store.dispatch({ type: "add-trigger", seq: "move" });
    store.dispatch({ type: "add-pose", name: "wave" });
    addColor(store, ["#abcdef"]);
    stroke(store, [[1, 0]]);

    expect(undoAll(store)).toBe(2);
    const { doc } = store.getState();
    expect(doc.name).toBe("Blob");
    expect(doc.sequences["move"]).toHaveLength(2);
    expect(Object.keys(doc.triggers)).toEqual(["click"]);
    expect(Object.keys(doc.poses)).toEqual(["default", "wave"]);
    expect(doc.palette).toHaveLength(5);
    expect([cell(store, 0, 0), cell(store, 1, 0)]).toEqual([EMPTY, EMPTY]);
  });
});

describe("undo: poses", () => {
  it("brings the changed pose onto the board when undoing and redoing", () => {
    const store = setup();
    store.dispatch({ type: "add-pose", name: "wave" });
    stroke(store, [[0, 0]], { pose: "wave" });

    store.dispatch({ type: "select-pose", name: "default" });
    undo(store);
    expect(store.getState().poseName).toBe("wave");

    store.dispatch({ type: "select-pose", name: "default" });
    redo(store);
    expect(store.getState().poseName).toBe("wave");
  });

  it("leaves the board on its pose when undoing a color change", () => {
    const store = setup();
    store.dispatch({ type: "add-pose", name: "wave" });
    pickColor(store, 2, ["#aa0000"]);

    undo(store);
    expect(store.getState().poseName).toBe("wave");
  });

  it("follows a renamed pose, in undo and in redo", () => {
    const store = setup();
    store.dispatch({ type: "add-pose", name: "wave" });
    stroke(store, [[0, 0]], { pose: "wave" });
    stroke(store, [[1, 0]], { pose: "wave" });
    undo(store);

    store.dispatch({ type: "rename-pose", from: "wave", to: "peek" });

    undo(store);
    expect(cell(store, 0, 0, "peek")).toBe(EMPTY);
    expect(store.getState().poseName).toBe("peek");
    expect(redoAll(store)).toBe(2);
    expect([cell(store, 0, 0, "peek"), cell(store, 1, 0, "peek")]).toEqual([INK, INK]);
    expect(store.getState().doc.poses).not.toHaveProperty("wave");
  });

  it("forgets a deleted pose's steps, in undo and in redo, and keeps the rest", () => {
    const store = setup();
    stroke(store, [[0, 0]]);
    store.dispatch({ type: "add-pose", name: "wave" });
    stroke(store, [[1, 1]], { pose: "wave" });
    stroke(store, [[2, 2]], { pose: "wave" });
    undo(store);

    store.dispatch({ type: "delete-pose", name: "wave" });
    expect(steps(store)).toEqual({ undo: true, redo: false });

    undo(store);
    expect(cell(store, 0, 0)).toBe(EMPTY);
    expect(steps(store).undo).toBe(false);
    expect(store.getState().doc.poses).not.toHaveProperty("wave");
  });

  it("gives a new pose with a deleted pose's name no history", () => {
    const store = setup();
    store.dispatch({ type: "add-pose", name: "wave" });
    stroke(store, [[0, 0]], { pose: "wave" });
    store.dispatch({ type: "delete-pose", name: "wave" });
    store.dispatch({ type: "add-pose", name: "wave" });

    expect(steps(store)).toEqual({ undo: false, redo: false });
  });
});

describe("undo: starting over", () => {
  it("clears undo and redo when another mascot replaces this one", () => {
    const store = withBothStacks();
    store.dispatch({ type: "replace-doc", doc: createBlankMascot() });
    expect(steps(store)).toEqual({ undo: false, redo: false });
  });

  it("clears undo and redo when the saved mascot loads", () => {
    const store = withBothStacks();
    store.dispatch({ type: "hydrate", doc: createBlankMascot() });
    expect(steps(store)).toEqual({ undo: false, redo: false });
  });

  // Known limitation: ⌘Z while the mouse is still down folds the
  // rest of that stroke into the previous step.
  it.todo("keeps the rest of a stroke out of the previous step when undo is pressed mid-stroke");
});

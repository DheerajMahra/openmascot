"use client";

import type { TriggerKind } from "@/lib/presets";
import type { MascotDoc, MascotFrame } from "@openmascot/embed";
import type { ReactNode } from "react";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react";

import {
  blankPose,
  floodFill,
  newId,
  normalizePose,
  randomPaintColor,
  setCell
} from "@/lib/pose-utils";
import { buildTrigger, uniqueTrigger } from "@/lib/presets";
import { loadCurrent, saveCurrent } from "@/lib/storage";
import clawdJson from "@/samples/clawd.json";

export type Tool = "pencil" | "mirror" | "eraser" | "fill";

export interface BoardOptions {
  centerLines: boolean;
}

/** One undo step: a pose's pixels or one palette slot, before and after. Undo tracks drawing only. */
export type MascotEdit =
  | { kind: "pixels"; pose: string; before: string; after: string }
  | { kind: "color"; index: number; before: string; after: string };

export interface MascotState {
  doc: MascotDoc;
  poseName: string;
  seqName: string;
  tool: Tool;
  colorIndex: number;
  history: MascotEdit[];
  future: MascotEdit[];
  hydrated: boolean;
  board: BoardOptions;
}

export type MascotAction =
  | { type: "hydrate"; doc: MascotDoc | null }
  | { type: "replace-doc"; doc: MascotDoc }
  | { type: "set-name"; name: string }
  | { type: "select-pose"; name: string }
  | { type: "select-seq"; name: string }
  | { type: "set-tool"; tool: Tool }
  | { type: "set-color"; index: number }
  | { type: "set-palette"; index: number; hex: string; commit: boolean }
  | { type: "add-color"; hex: string }
  | { type: "paint"; pose: string; value: string; commit: boolean }
  | {
      type: "paint-cell";
      pose: string;
      x: number;
      y: number;
      ch: string;
      commit: boolean;
      /** Also paint the cell reflected across the vertical center line. */
      mirror?: boolean;
    }
  | { type: "fill-cell"; pose: string; x: number; y: number; ch: string }
  | { type: "reset-pose"; name: string }
  | { type: "clear-pose"; name: string }
  | { type: "add-pose"; name?: string; from?: string }
  | { type: "rename-pose"; from: string; to: string }
  | { type: "delete-pose"; name: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "add-seq"; name: string; frames?: MascotFrame[]; from?: string }
  | { type: "rename-seq"; from: string; to: string }
  | { type: "delete-seq"; name: string }
  | { type: "set-frame"; seq: string; index: number; frame: Partial<MascotFrame> }
  | { type: "add-frame"; seq: string; frame?: MascotFrame }
  | { type: "remove-frame"; seq: string; index: number }
  | { type: "move-frame"; seq: string; index: number; dir: -1 | 1 }
  | { type: "reorder-frame"; seq: string; from: number; to: number }
  | { type: "add-trigger"; seq: string }
  | { type: "replace-trigger"; from: string; to: string; seq: string }
  | { type: "remove-trigger"; key: string }
  | { type: "set-board-option"; option: keyof BoardOptions; value: boolean };

const CLAWD = clawdJson as unknown as MascotDoc;
const MAX_HISTORY = 50;
/** Pose cells hold one base-36 character per palette index. */
export const MAX_COLORS = 36;

export const createBlankMascot = (): MascotDoc => {
  const grid = { w: 24, h: 16 };
  return {
    id: newId(),
    name: "Untitled",
    version: 1,
    grid,
    tick: 60,
    palette: [randomPaintColor()],
    poses: { default: blankPose(grid.w, grid.h) },
    sequences: { move: [{ pose: "default", hold: 4 }] },
    triggers: {}
  };
};

const firstSeq = (doc: MascotDoc): string => Object.keys(doc.sequences)[0] ?? "";

const initialState: MascotState = {
  doc: CLAWD,
  poseName: "default",
  seqName: firstSeq(CLAWD),
  tool: "pencil",
  colorIndex: 1,
  history: [],
  future: [],
  hydrated: false,
  board: { centerLines: true }
};

/** A gesture that changed nothing, like a click on a cell already that color. Only the top entry can be one. */
const isEmptyEdit = (e: MascotEdit): boolean => e.before === e.after;

const sameTarget = (a: MascotEdit, b: MascotEdit): boolean =>
  a.kind === "pixels"
    ? b.kind === "pixels" && a.pose === b.pose
    : b.kind === "color" && a.index === b.index;

/** History without an empty entry on top. */
const settled = (history: MascotEdit[]): MascotEdit[] => {
  const top = history[history.length - 1];
  return top && isEmptyEdit(top) ? history.slice(0, -1) : history;
};

/**
 * Records a drawing edit. A commit starts a new step; later ticks of the same gesture stretch it,
 * and a tick with no matching step (tuning a just-added color) goes unrecorded. Redo is dropped
 * once the step actually changes something.
 */
const record = (
  s: MascotState,
  edit: MascotEdit,
  commit: boolean
): Pick<MascotState, "history" | "future"> => {
  if (commit) {
    const history = [...settled(s.history).slice(-(MAX_HISTORY - 1)), edit];
    return { history, future: isEmptyEdit(edit) ? s.future : [] };
  }
  const top = s.history[s.history.length - 1];
  if (!top || !sameTarget(top, edit)) return { history: s.history, future: s.future };
  const stretched = { ...top, after: edit.after };
  return {
    history: [...s.history.slice(0, -1), stretched],
    future: isEmptyEdit(stretched) ? s.future : []
  };
};

/** New pixels for a pose, recorded for undo. */
const withPixels = (s: MascotState, pose: string, value: string, commit = true): MascotState => {
  const { w, h } = s.doc.grid;
  const before = normalizePose(s.doc.poses[pose] ?? "", w, h);
  const doc = { ...s.doc, poses: { ...s.doc.poses, [pose]: value } };
  return { ...s, doc, ...record(s, { kind: "pixels", pose, before, after: value }, commit) };
};

/** Puts one side of an edit back into the current doc. Pixel edits bring their pose onto the board. */
const applyEdit = (s: MascotState, edit: MascotEdit, value: string): MascotState => {
  if (edit.kind === "color") {
    const palette = s.doc.palette.map((c, i) => (i === edit.index ? value : c));
    return { ...s, doc: { ...s.doc, palette } };
  }
  return {
    ...s,
    doc: { ...s.doc, poses: { ...s.doc.poses, [edit.pose]: value } },
    poseName: edit.pose
  };
};

const renameKey = <T,>(obj: Record<string, T>, from: string, to: string): Record<string, T> => {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(obj)) out[k === from ? to : k] = v;
  return out;
};

const omitKey = <T,>(obj: Record<string, T>, key: string): Record<string, T> => {
  const out = { ...obj };
  delete out[key];
  return out;
};

/** Docs saved before moves stopped looping carry an "idle" trigger the runtime no longer reads. */
const migrateDoc = (doc: MascotDoc): MascotDoc =>
  "idle" in doc.triggers ? { ...doc, triggers: omitKey(doc.triggers, "idle") } : doc;

const slug = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A pose name as stored: lower case letters, digits, single spaces, "-" and "_", at most 32 characters. */
export const toPoseName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9 _-]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 32)
    .replace(/^[\s_-]+|[\s_-]+$/g, "");

/** "default 1", or the next number up if that is taken. */
export const nextPoseName = (poses: Record<string, string>): string => {
  let n = 1;
  while (`default ${n}` in poses) n++;
  return `default ${n}`;
};

/** Every trigger key that plays this sequence, in table order. */
export const triggersFor = (doc: MascotDoc, seq: string): string[] =>
  Object.entries(doc.triggers)
    .filter(([, value]) => value === seq)
    .map(([key]) => key);

/** Trigger kinds a new row can take, tried in order until one is free. */
const TRIGGER_DEFAULTS: TriggerKind[] = ["click", "hover", "load", "interval"];

const freeTriggerKey = (triggers: Record<string, string>): string => {
  for (const kind of TRIGGER_DEFAULTS) {
    const key = buildTrigger(kind, "");
    if (!(key in triggers)) return key;
  }
  return uniqueTrigger("custom", triggers);
};

const reducer = (s: MascotState, a: MascotAction): MascotState => {
  const { doc } = s;
  const { w, h } = doc.grid;
  switch (a.type) {
    case "hydrate": {
      if (!a.doc) return { ...s, hydrated: true };
      const next = migrateDoc(a.doc);
      return {
        ...s,
        doc: next,
        seqName: s.seqName in next.sequences ? s.seqName : firstSeq(next),
        history: [],
        future: [],
        hydrated: true
      };
    }
    case "replace-doc": {
      const next = migrateDoc(a.doc);
      return {
        ...s,
        doc: next,
        poseName: "default" in next.poses ? "default" : (Object.keys(next.poses)[0] ?? "default"),
        seqName: firstSeq(next),
        colorIndex: Math.min(1, next.palette.length - 1),
        history: [],
        future: []
      };
    }
    case "set-name":
      return { ...s, doc: { ...doc, name: a.name } };
    case "select-pose":
      return { ...s, poseName: a.name };
    case "select-seq":
      return { ...s, seqName: a.name };
    case "set-tool":
      return { ...s, tool: a.tool };
    case "set-color":
      return { ...s, colorIndex: a.index };
    case "set-palette": {
      const before = doc.palette[a.index];
      // A pick that starts on the same color still opens its undo step, so its later ticks have one to stretch.
      if (before === undefined || (before === a.hex && !a.commit)) return s;
      // Poses point at palette slots, so every pixel painted with this color changes with it.
      const palette = doc.palette.map((c, i) => (i === a.index ? a.hex : c));
      const edit: MascotEdit = { kind: "color", index: a.index, before, after: a.hex };
      return { ...s, doc: { ...doc, palette }, ...record(s, edit, a.commit) };
    }
    case "add-color": {
      if (doc.palette.length >= MAX_COLORS) return s;
      const palette = [...doc.palette, a.hex];
      return { ...s, doc: { ...doc, palette }, colorIndex: palette.length - 1 };
    }
    case "paint":
      return withPixels(s, a.pose, a.value, a.commit);
    case "paint-cell": {
      const before = normalizePose(doc.poses[a.pose] ?? "", w, h);
      let value = setCell(before, w, a.x, a.y, a.ch);
      if (a.mirror) value = setCell(value, w, w - 1 - a.x, a.y, a.ch);
      if (value === before && !a.commit) return s;
      return withPixels(s, a.pose, value, a.commit);
    }
    case "fill-cell": {
      const before = normalizePose(doc.poses[a.pose] ?? "", w, h);
      const value = floodFill(before, w, h, a.x, a.y, a.ch);
      if (value === before) return s;
      return withPixels(s, a.pose, value);
    }
    case "reset-pose": {
      if (a.name === "default") return s;
      return withPixels(s, a.name, normalizePose(doc.poses["default"] ?? "", w, h));
    }
    case "clear-pose":
      return withPixels(s, a.name, blankPose(w, h));
    case "add-pose": {
      const name = a.name === undefined ? nextPoseName(doc.poses) : toPoseName(a.name);
      if (!name || name in doc.poses) return s;
      const value = normalizePose(doc.poses[a.from ?? "default"] ?? "", w, h);
      return { ...s, doc: { ...doc, poses: { ...doc.poses, [name]: value } }, poseName: name };
    }
    case "rename-pose": {
      const to = toPoseName(a.to);
      if (!to || to in doc.poses || a.from === "default") return s;
      const sequences: MascotDoc["sequences"] = {};
      for (const [k, seq] of Object.entries(doc.sequences)) {
        sequences[k] = seq.map(f => (f.pose === a.from ? { ...f, pose: to } : f));
      }
      // Undo steps follow the pose to its new name.
      const rename = (e: MascotEdit): MascotEdit =>
        e.kind === "pixels" && e.pose === a.from ? { ...e, pose: to } : e;
      return {
        ...s,
        doc: { ...doc, poses: renameKey(doc.poses, a.from, to), sequences },
        poseName: s.poseName === a.from ? to : s.poseName,
        history: s.history.map(rename),
        future: s.future.map(rename)
      };
    }
    case "delete-pose": {
      if (a.name === "default") return s;
      const sequences: MascotDoc["sequences"] = {};
      for (const [k, seq] of Object.entries(doc.sequences)) {
        sequences[k] = seq.map(f => (f.pose === a.name ? { ...f, pose: "default" } : f));
      }
      // Deleting is final: the pose's undo steps go with it.
      const keep = (e: MascotEdit) => e.kind !== "pixels" || e.pose !== a.name;
      return {
        ...s,
        doc: { ...doc, poses: omitKey(doc.poses, a.name), sequences },
        poseName: s.poseName === a.name ? "default" : s.poseName,
        history: s.history.filter(keep),
        future: s.future.filter(keep)
      };
    }
    case "undo": {
      const history = settled(s.history);
      const edit = history[history.length - 1];
      if (!edit) return s;
      return {
        ...applyEdit(s, edit, edit.before),
        history: history.slice(0, -1),
        future: [edit, ...s.future].slice(0, MAX_HISTORY)
      };
    }
    case "redo": {
      const edit = s.future[0];
      if (!edit) return s;
      return {
        ...applyEdit(s, edit, edit.after),
        future: s.future.slice(1),
        history: [...settled(s.history).slice(-(MAX_HISTORY - 1)), edit]
      };
    }
    case "add-seq": {
      let name = slug(a.name) || "move";
      let n = 2;
      while (name in doc.sequences) name = `${slug(a.name) || "move"}-${n++}`;
      const frames = a.frames
        ? a.frames.map(f => ({ ...f }))
        : a.from
          ? (doc.sequences[a.from] ?? []).map(f => ({ ...f }))
          : [{ pose: "default", hold: 4 }];
      return {
        ...s,
        doc: { ...doc, sequences: { ...doc.sequences, [name]: frames } },
        seqName: name
      };
    }
    case "rename-seq": {
      const to = slug(a.to);
      if (!to || to === a.from || to in doc.sequences) return s;
      const triggers: MascotDoc["triggers"] = {};
      for (const [k, v] of Object.entries(doc.triggers)) triggers[k] = v === a.from ? to : v;
      return {
        ...s,
        doc: { ...doc, sequences: renameKey(doc.sequences, a.from, to), triggers },
        seqName: s.seqName === a.from ? to : s.seqName
      };
    }
    case "delete-seq": {
      // A mascot keeps at least one move, the way a move keeps at least one step.
      if (!(a.name in doc.sequences) || Object.keys(doc.sequences).length <= 1) return s;
      const triggers: MascotDoc["triggers"] = {};
      for (const [k, v] of Object.entries(doc.triggers)) if (v !== a.name) triggers[k] = v;
      const sequences = omitKey(doc.sequences, a.name);
      return {
        ...s,
        doc: { ...doc, sequences, triggers },
        seqName: s.seqName === a.name ? firstSeq({ ...doc, sequences }) : s.seqName
      };
    }
    case "set-frame": {
      const seq = doc.sequences[a.seq];
      if (!seq) return s;
      const frames = seq.map((f, i) => (i === a.index ? { ...f, ...a.frame } : f));
      return { ...s, doc: { ...doc, sequences: { ...doc.sequences, [a.seq]: frames } } };
    }
    case "add-frame": {
      const seq = doc.sequences[a.seq];
      if (!seq) return s;
      const last = seq[seq.length - 1];
      const frames = [...seq, a.frame ?? { pose: last?.pose ?? "default", hold: 4 }];
      return { ...s, doc: { ...doc, sequences: { ...doc.sequences, [a.seq]: frames } } };
    }
    case "remove-frame": {
      const seq = doc.sequences[a.seq];
      if (!seq || seq.length <= 1) return s;
      const frames = seq.filter((_, i) => i !== a.index);
      return { ...s, doc: { ...doc, sequences: { ...doc.sequences, [a.seq]: frames } } };
    }
    case "move-frame": {
      const seq = doc.sequences[a.seq];
      if (!seq) return s;
      const j = a.index + a.dir;
      const current = seq[a.index];
      const other = seq[j];
      if (!current || !other) return s;
      const frames = seq.slice();
      frames[a.index] = other;
      frames[j] = current;
      return { ...s, doc: { ...doc, sequences: { ...doc.sequences, [a.seq]: frames } } };
    }
    case "reorder-frame": {
      const seq = doc.sequences[a.seq];
      if (!seq || a.from === a.to) return s;
      const moving = seq[a.from];
      if (!moving || a.to < 0 || a.to >= seq.length) return s;
      const frames = seq.filter((_, i) => i !== a.from);
      frames.splice(a.to, 0, moving);
      return { ...s, doc: { ...doc, sequences: { ...doc.sequences, [a.seq]: frames } } };
    }
    case "add-trigger": {
      if (!(a.seq in doc.sequences)) return s;
      const key = freeTriggerKey(doc.triggers);
      return { ...s, doc: { ...doc, triggers: { ...doc.triggers, [key]: a.seq } } };
    }
    case "replace-trigger": {
      // Keys are unique, so a row can't take a "when" another row already has.
      if (a.to !== a.from && a.to in doc.triggers) return s;
      const triggers: MascotDoc["triggers"] = {};
      let found = false;
      for (const [k, v] of Object.entries(doc.triggers)) {
        if (k === a.from) {
          triggers[a.to] = a.seq;
          found = true;
        } else triggers[k] = v;
      }
      if (!found) triggers[a.to] = a.seq;
      return { ...s, doc: { ...doc, triggers } };
    }
    case "remove-trigger":
      if (!(a.key in doc.triggers)) return s;
      return { ...s, doc: { ...doc, triggers: omitKey(doc.triggers, a.key) } };
    case "set-board-option":
      return { ...s, board: { ...s.board, [a.option]: a.value } };
    default:
      return s;
  }
};

export interface MascotStore {
  getState: () => MascotState;
  /** What the server rendered with; hydration must match it, whatever the store holds by then. */
  getInitialState: () => MascotState;
  dispatch: (action: MascotAction) => void;
  subscribe: (listener: () => void) => () => void;
}

/** A tiny external store around the reducer, so components can subscribe to just the slice they read. */
export const createMascotStore = (initial: MascotState = initialState): MascotStore => {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    getInitialState: () => initial,
    dispatch: action => {
      const next = reducer(state, action);
      if (next === state) return;
      state = next;
      for (const listener of listeners) listener();
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

/** Subscribes to one slice. The selector must return something stable: a primitive or a part of the state, never a fresh object. */
const useStoreSelector = <T,>(store: MascotStore, selector: (s: MascotState) => T): T => {
  const getSnapshot = () => selector(store.getState());
  const getServerSnapshot = () => selector(store.getInitialState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
};

const MascotStoreContext = createContext<MascotStore | null>(null);

export const MascotProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(createMascotStore);
  const doc = useStoreSelector(store, s => s.doc);
  const hydrated = useStoreSelector(store, s => s.hydrated);

  // The doc storage already holds. Starts as the one loaded, so loading doesn't fake an "edited just now";
  // compared to the last save (not the load) so undoing back to the loaded doc still saves.
  const savedDoc = useRef<MascotDoc | null>(null);

  useEffect(() => {
    const stored = loadCurrent();
    savedDoc.current = stored;
    store.dispatch({ type: "hydrate", doc: stored });
  }, [store]);

  useEffect(() => {
    if (!hydrated || doc === savedDoc.current) return;
    saveCurrent(doc);
    savedDoc.current = doc;
  }, [doc, hydrated]);

  return <MascotStoreContext.Provider value={store}>{children}</MascotStoreContext.Provider>;
};

const useMascotStore = (): MascotStore => {
  const store = useContext(MascotStoreContext);
  if (!store) throw new Error("Mascot hooks must be used inside MascotProvider");
  return store;
};

/** Re-renders only when the selected value changes. See useStoreSelector for the stability rule. */
export const useMascotSelector = <T,>(selector: (s: MascotState) => T): T =>
  useStoreSelector(useMascotStore(), selector);

/** Stable for the life of the provider. */
export const useMascotDispatch = (): MascotStore["dispatch"] => useMascotStore().dispatch;

/** The mascot being edited. */
export const useMascotDoc = (): MascotDoc => useMascotSelector(s => s.doc);

/** Whether the saved mascot has been loaded from this browser yet. */
export const useMascotHydrated = (): boolean => useMascotSelector(s => s.hydrated);

/** The pose open on Make and the move open on Animate. */
export const useEditorSelection = (): { poseName: string; seqName: string } => ({
  poseName: useMascotSelector(s => s.poseName),
  seqName: useMascotSelector(s => s.seqName)
});

/** What a click on the board does: the tool and the color it paints with. */
export const useEditorTool = (): { tool: Tool; colorIndex: number } => ({
  tool: useMascotSelector(s => s.tool),
  colorIndex: useMascotSelector(s => s.colorIndex)
});

export const useBoardOptions = (): BoardOptions => useMascotSelector(s => s.board);

/** Whether undo has a step that changes something; the top one can be an empty click. */
export const canUndo = (s: MascotState): boolean => s.history.some(e => !isEmptyEdit(e));

export const canRedo = (s: MascotState): boolean => s.future.length > 0;

export const useUndoAvailability = (): { canUndo: boolean; canRedo: boolean } => ({
  canUndo: useMascotSelector(canUndo),
  canRedo: useMascotSelector(canRedo)
});

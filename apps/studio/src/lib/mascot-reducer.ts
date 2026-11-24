import type { MascotEdit, UndoStacks } from "@/lib/edit-history";
import type { StartFrom } from "@/lib/samples";
import type { MascotDoc, MascotFrame } from "openmascot";

import { clawd } from "@openmascot/samples";
import { MAX_COLORS } from "openmascot";

import {
  UNTITLED,
  firstSeq,
  freeTriggerKey,
  nextPoseName,
  omitKey,
  renameKey,
  repointPose,
  repointTriggers,
  toMoveName,
  toPoseName
} from "@/lib/doc-edits";
import { dropPoseEdits, record, renamePoseEdits, takeRedo, takeUndo } from "@/lib/edit-history";
import { blankPose, floodFill, normalizePose, setCell } from "@/lib/pose-utils";
import { DEFAULT_HOLD } from "@/lib/presets";

/*
 * The editor's state and the pure reducer that changes it. No React and no storage: the store in
 * mascot-store.tsx runs this reducer, and autosave watches what it produces.
 */

export type Tool = "pencil" | "mirror" | "eraser" | "fill";

export interface BoardOptions {
  centerLines: boolean;
}

/**
 * Where the open mascot stands. `loading`: nothing opened for this URL yet. `draft`: a fresh copy
 * from a starting point, not stored until its first change. `saved`: in the library, every change
 * saves. `missing`: the URL names an id that isn't saved.
 */
export type MascotStatus = "loading" | "draft" | "saved" | "missing";

export interface MascotState extends UndoStacks {
  doc: MascotDoc;
  status: MascotStatus;
  /** The starting point a draft was made from; null once saved. */
  from: StartFrom | null;
  /** The id the URL asked for when status is `missing`. */
  missingId: string | null;
  poseName: string;
  seqName: string;
  tool: Tool;
  colorIndex: number;
  board: BoardOptions;
}

export type MascotAction =
  | { type: "open-draft"; doc: MascotDoc; from: StartFrom }
  | { type: "open-saved"; doc: MascotDoc }
  | { type: "open-missing"; id: string }
  | { type: "mark-saved" }
  | { type: "close"; id: string }
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

const CLAWD = clawd;

/** Clawd stands in until a mascot opens; nothing renders it while status is `loading`. */
export const initialState: MascotState = {
  doc: CLAWD,
  status: "loading",
  from: null,
  missingId: null,
  poseName: "default",
  seqName: firstSeq(CLAWD),
  tool: "pencil",
  colorIndex: 1,
  history: [],
  future: [],
  board: { centerLines: true }
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

/**
 * A name left blank (say, the page closed mid-edit) reads as Untitled once the mascot opens again.
 * Format migrations happen earlier, in the runtime's parseMascotDoc, as the library reads a doc.
 */
const withName = (doc: MascotDoc): MascotDoc =>
  doc.name.trim() ? doc : { ...doc, name: UNTITLED };

/** A freshly opened mascot: its default pose and first move selected, no undo history. */
const opened = (s: MascotState, doc: MascotDoc): MascotState => {
  const next = withName(doc);
  return {
    ...s,
    doc: next,
    missingId: null,
    poseName: "default" in next.poses ? "default" : (Object.keys(next.poses)[0] ?? "default"),
    seqName: firstSeq(next),
    colorIndex: Math.min(1, next.palette.length - 1),
    history: [],
    future: []
  };
};

/**
 * Changes one move's steps. A move that doesn't exist, or a change that returns null (nothing to
 * do), leaves the state exactly as it was, so nothing re-renders or saves.
 */
const withFrames = (
  s: MascotState,
  seq: string,
  change: (frames: MascotFrame[]) => MascotFrame[] | null
): MascotState => {
  const frames = s.doc.sequences[seq];
  const next = frames && change(frames);
  return next ? { ...s, doc: { ...s.doc, sequences: { ...s.doc.sequences, [seq]: next } } } : s;
};

export const reducer = (s: MascotState, a: MascotAction): MascotState => {
  const { doc } = s;
  const { w, h } = doc.grid;
  switch (a.type) {
    case "open-draft":
      return { ...opened(s, a.doc), status: "draft", from: a.from };
    case "open-saved":
      return { ...opened(s, a.doc), status: "saved", from: null };
    case "open-missing":
      return { ...s, status: "missing", from: null, missingId: a.id, history: [], future: [] };
    case "mark-saved":
      return s.status === "draft" ? { ...s, status: "saved", from: null } : s;
    case "close":
      // Back to loading, so the closed mascot can't be edited (and saved) again.
      return s.doc.id === a.id && s.status !== "loading" ? { ...s, status: "loading" } : s;
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
      const from = a.from ?? "default";
      const name = a.name === undefined ? nextPoseName(doc.poses, from) : toPoseName(a.name);
      if (!name || name in doc.poses) return s;
      const value = normalizePose(doc.poses[from] ?? "", w, h);
      return { ...s, doc: { ...doc, poses: { ...doc.poses, [name]: value } }, poseName: name };
    }
    case "rename-pose": {
      const to = toPoseName(a.to);
      if (!to || to in doc.poses || a.from === "default") return s;
      const sequences = repointPose(doc.sequences, a.from, to);
      return {
        ...s,
        doc: { ...doc, poses: renameKey(doc.poses, a.from, to), sequences },
        poseName: s.poseName === a.from ? to : s.poseName,
        ...renamePoseEdits(s, a.from, to)
      };
    }
    case "delete-pose": {
      if (a.name === "default") return s;
      const sequences = repointPose(doc.sequences, a.name, "default");
      return {
        ...s,
        doc: { ...doc, poses: omitKey(doc.poses, a.name), sequences },
        poseName: s.poseName === a.name ? "default" : s.poseName,
        ...dropPoseEdits(s, a.name)
      };
    }
    case "undo": {
      const step = takeUndo(s);
      return step ? { ...applyEdit(s, step.edit, step.edit.before), ...step.stacks } : s;
    }
    case "redo": {
      const step = takeRedo(s);
      return step ? { ...applyEdit(s, step.edit, step.edit.after), ...step.stacks } : s;
    }
    case "add-seq": {
      const base = toMoveName(a.name) || "move";
      let name = base;
      for (let n = 2; name in doc.sequences; n++) name = `${base}-${n}`;
      let frames: MascotFrame[];
      if (a.frames) frames = a.frames.map(f => ({ ...f }));
      else if (a.from) frames = (doc.sequences[a.from] ?? []).map(f => ({ ...f }));
      else frames = [{ pose: "default", hold: DEFAULT_HOLD }];
      return {
        ...s,
        doc: { ...doc, sequences: { ...doc.sequences, [name]: frames } },
        seqName: name
      };
    }
    case "rename-seq": {
      const to = toMoveName(a.to);
      if (!to || to === a.from || to in doc.sequences) return s;
      const triggers = repointTriggers(doc.triggers, a.from, to);
      return {
        ...s,
        doc: { ...doc, sequences: renameKey(doc.sequences, a.from, to), triggers },
        seqName: s.seqName === a.from ? to : s.seqName
      };
    }
    case "delete-seq": {
      // A mascot keeps at least one move, the way a move keeps at least one step.
      if (!(a.name in doc.sequences) || Object.keys(doc.sequences).length <= 1) return s;
      const triggers = repointTriggers(doc.triggers, a.name, null);
      const sequences = omitKey(doc.sequences, a.name);
      return {
        ...s,
        doc: { ...doc, sequences, triggers },
        seqName: s.seqName === a.name ? firstSeq({ ...doc, sequences }) : s.seqName
      };
    }
    case "set-frame":
      return withFrames(s, a.seq, frames =>
        frames.map((f, i) => (i === a.index ? { ...f, ...a.frame } : f))
      );
    case "add-frame":
      return withFrames(s, a.seq, frames => {
        const last = frames[frames.length - 1];
        return [...frames, a.frame ?? { pose: last?.pose ?? "default", hold: DEFAULT_HOLD }];
      });
    case "remove-frame":
      // A move keeps at least one step.
      return withFrames(s, a.seq, frames =>
        frames.length > 1 ? frames.filter((_, i) => i !== a.index) : null
      );
    case "move-frame":
      return withFrames(s, a.seq, frames => {
        const j = a.index + a.dir;
        const current = frames[a.index];
        const other = frames[j];
        if (!current || !other) return null;
        const next = frames.slice();
        next[a.index] = other;
        next[j] = current;
        return next;
      });
    case "reorder-frame":
      return withFrames(s, a.seq, frames => {
        const moving = frames[a.from];
        if (a.from === a.to || !moving || a.to < 0 || a.to >= frames.length) return null;
        const next = frames.filter((_, i) => i !== a.from);
        next.splice(a.to, 0, moving);
        return next;
      });
    case "add-trigger": {
      if (!(a.seq in doc.sequences)) return s;
      const key = freeTriggerKey(doc.triggers);
      return { ...s, doc: { ...doc, triggers: { ...doc.triggers, [key]: a.seq } } };
    }
    case "replace-trigger": {
      // Keys are unique, so a row can't take a "when" another row already has.
      if (a.to !== a.from && a.to in doc.triggers) return s;
      // Takes the old row's place in the table, or joins the end if there was no old row.
      const triggers = { ...renameKey(doc.triggers, a.from, a.to), [a.to]: a.seq };
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

/** Whether the editor can show this mascot: it is open, as a draft or saved, under that id. */
export const showsMascot = (s: MascotState, id: string): boolean =>
  (s.status === "draft" || s.status === "saved") && s.doc.id === id;

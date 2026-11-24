/*
 * Undo and redo for drawing. Each entry holds one pose's pixels, or one palette slot, before and
 * after a gesture. Structure edits (moves, names, triggers) are not undoable.
 */

/** One undo step: a pose's pixels or one palette slot, before and after. */
export type MascotEdit =
  | { kind: "pixels"; pose: string; before: string; after: string }
  | { kind: "color"; index: number; before: string; after: string };

/** The undo stack (oldest first) and the redo stack (next redo first). */
export interface UndoStacks {
  history: MascotEdit[];
  future: MascotEdit[];
}

const MAX_HISTORY = 50;

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

/** `edit` on top of the settled history, keeping the newest MAX_HISTORY entries. */
const pushed = (history: MascotEdit[], edit: MascotEdit): MascotEdit[] => [
  ...settled(history).slice(-(MAX_HISTORY - 1)),
  edit
];

/**
 * Records a drawing edit. A commit starts a new step; later ticks of the same gesture stretch it,
 * and a tick with no matching step (tuning a just-added color) goes unrecorded. Redo is dropped
 * once the step actually changes something.
 */
export const record = (stacks: UndoStacks, edit: MascotEdit, commit: boolean): UndoStacks => {
  if (commit) {
    return {
      history: pushed(stacks.history, edit),
      future: isEmptyEdit(edit) ? stacks.future : []
    };
  }
  const top = stacks.history[stacks.history.length - 1];
  if (!top || !sameTarget(top, edit)) return { history: stacks.history, future: stacks.future };
  const stretched = { ...top, after: edit.after };
  return {
    history: [...stacks.history.slice(0, -1), stretched],
    future: isEmptyEdit(stretched) ? stacks.future : []
  };
};

/** The step undo reverses and the stacks after it, or null when there is nothing to undo. */
export const takeUndo = (stacks: UndoStacks): { edit: MascotEdit; stacks: UndoStacks } | null => {
  const history = settled(stacks.history);
  const edit = history[history.length - 1];
  if (!edit) return null;
  return {
    edit,
    stacks: {
      history: history.slice(0, -1),
      future: [edit, ...stacks.future].slice(0, MAX_HISTORY)
    }
  };
};

/** The step redo applies and the stacks after it, or null when there is nothing to redo. */
export const takeRedo = (stacks: UndoStacks): { edit: MascotEdit; stacks: UndoStacks } | null => {
  const edit = stacks.future[0];
  if (!edit) return null;
  return {
    edit,
    stacks: { history: pushed(stacks.history, edit), future: stacks.future.slice(1) }
  };
};

/** Undo steps follow a pose to its new name. */
export const renamePoseEdits = (stacks: UndoStacks, from: string, to: string): UndoStacks => {
  const rename = (e: MascotEdit): MascotEdit =>
    e.kind === "pixels" && e.pose === from ? { ...e, pose: to } : e;
  return { history: stacks.history.map(rename), future: stacks.future.map(rename) };
};

/** Deleting a pose is final: its undo steps go with it. */
export const dropPoseEdits = (stacks: UndoStacks, pose: string): UndoStacks => {
  const keep = (e: MascotEdit) => e.kind !== "pixels" || e.pose !== pose;
  return { history: stacks.history.filter(keep), future: stacks.future.filter(keep) };
};

/** Whether undo has a step that changes something; the top one can be an empty click. */
export const canUndo = (stacks: UndoStacks): boolean => stacks.history.some(e => !isEmptyEdit(e));

export const canRedo = (stacks: UndoStacks): boolean => stacks.future.length > 0;

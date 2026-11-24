import type { MascotState } from "@/lib/mascot-reducer";
import type { MascotRepository } from "@/lib/mascot-repository";
import type { MascotStore } from "@/lib/mascot-store";

/** Whether prev and next hold the same open mascot, as opposed to one being opened, closed or saved. */
const sameOpenMascot = (prev: MascotState, next: MascotState): boolean =>
  next.doc.id === prev.doc.id &&
  next.status === prev.status &&
  (next.status === "draft" || next.status === "saved");

/**
 * Saves every change to the open mascot. A draft's first change stores it and makes it saved, then
 * `onFirstSave` runs. Opening a mascot never saves it. A change is a doc whose content differs from
 * what was last opened or saved: gestures that change nothing (erasing an empty cell, a color pick
 * that ends where it began) still hand the store a new doc, and must not save a draft.
 * Returns the unsubscribe.
 */
export const createAutosave = (
  store: MascotStore,
  repo: MascotRepository,
  onFirstSave: (id: string) => void
): (() => void) => {
  let prev = store.getState();
  let baseline = JSON.stringify(prev.doc);
  return store.subscribe(() => {
    const next = store.getState();
    const same = sameOpenMascot(prev, next);
    const docChanged = next.doc !== prev.doc;
    prev = next;
    if (!same) {
      baseline = JSON.stringify(next.doc);
      return;
    }
    if (!docChanged) return;
    const content = JSON.stringify(next.doc);
    if (content === baseline) return;
    baseline = content;
    void repo.save(next.doc);
    if (next.status === "draft") {
      store.dispatch({ type: "mark-saved" });
      onFirstSave(next.doc.id);
    }
  });
};

"use client";

import type {
  BoardOptions,
  MascotAction,
  MascotState,
  MascotStatus,
  Tool
} from "@/lib/mascot-reducer";
import type { MascotRepository } from "@/lib/mascot-repository";
import type { MascotDoc } from "openmascot";
import type { ReactNode } from "react";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";

import { canRedo, canUndo } from "@/lib/edit-history";
import { mascotRepository } from "@/lib/local-mascot-repository";
import { initialState, reducer } from "@/lib/mascot-reducer";

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

/** Subscribes to one slice. The selector must return something stable: a primitive or a part of the state, never a fresh object. */
const useStoreSelector = <T,>(store: MascotStore, selector: (s: MascotState) => T): T => {
  const getSnapshot = () => selector(store.getState());
  const getServerSnapshot = () => selector(store.getInitialState());
  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
};

const MascotStoreContext = createContext<MascotStore | null>(null);

export const MascotProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(createMascotStore);

  // The URL already carries the id; dropping ?from= makes a reload open the saved mascot, not a fresh copy.
  useEffect(
    () =>
      createAutosave(store, mascotRepository, () =>
        window.history.replaceState(null, "", window.location.pathname)
      ),
    [store]
  );

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

export const useMascotStatus = (): MascotStatus => useMascotSelector(s => s.status);

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

export const useUndoAvailability = (): { canUndo: boolean; canRedo: boolean } => ({
  canUndo: useMascotSelector(canUndo),
  canRedo: useMascotSelector(canRedo)
});

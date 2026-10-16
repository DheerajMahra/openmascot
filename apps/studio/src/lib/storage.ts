import type { MascotDoc } from "@openmascot/embed";

/** One mascot is kept in this browser at a time. */
const CURRENT_KEY = "openmascot:current";
const EDITED_KEY = "openmascot:edited";

const readRaw = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable (private mode, quota): the editor still works in memory
  }
};

export const loadCurrent = (): MascotDoc | null => {
  const raw = readRaw(CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MascotDoc;
  } catch {
    return null;
  }
};

/** Autosave: the doc plus when it last changed, for the Start page's Continue card. */
export const saveCurrent = (doc: MascotDoc): void => {
  write(CURRENT_KEY, JSON.stringify(doc));
  write(EDITED_KEY, new Date().toISOString());
};

/* --- useSyncExternalStore plumbing: ISO time of the last edit, or null when nothing is saved --- */

export const subscribeEdited = (onChange: () => void): (() => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

export const getEditedSnapshot = (): string | null =>
  readRaw(CURRENT_KEY) ? readRaw(EDITED_KEY) : null;

export const getEditedServerSnapshot = (): string | null => null;

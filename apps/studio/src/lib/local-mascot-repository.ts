import type { MascotRepository, SavedMascot } from "@/lib/mascot-repository";
import type { MascotDoc } from "openmascot";

/** One key per mascot, so autosave rewrites only the one being edited and there's no index to drift. */
const PREFIX = "openmascot:mascot:";
/** Where the previous version kept its single mascot. */
const LEGACY_DOC_KEY = "openmascot:current";
const LEGACY_EDITED_KEY = "openmascot:edited";

const keyFor = (id: string): string => `${PREFIX}${id}`;

const parse = (raw: string | null): SavedMascot | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SavedMascot> | null;
    if (typeof value?.doc?.id !== "string" || typeof value.updatedAt !== "string") return null;
    return value as SavedMascot;
  } catch {
    return null;
  }
};

/**
 * Turns the previous version's single save into a library entry. The old keys go only once the
 * entry is safely written (or the old save turns out unreadable), so a failed write loses nothing.
 */
const moveLegacySave = (storage: Storage): void => {
  const raw = storage.getItem(LEGACY_DOC_KEY);
  if (raw === null) return;
  let doc: MascotDoc | null = null;
  try {
    doc = JSON.parse(raw) as MascotDoc;
  } catch {
    // unreadable: nothing worth keeping
  }
  if (typeof doc?.id === "string" && storage.getItem(keyFor(doc.id)) === null) {
    const updatedAt = storage.getItem(LEGACY_EDITED_KEY) ?? new Date().toISOString();
    storage.setItem(keyFor(doc.id), JSON.stringify({ doc, updatedAt }));
  }
  storage.removeItem(LEGACY_DOC_KEY);
  storage.removeItem(LEGACY_EDITED_KEY);
};

/**
 * Saved mascots in Web Storage. `getStorage` is called on every use and may throw (private mode,
 * blocked site data); every failure is swallowed so the editor keeps working in memory.
 */
export const createLocalMascotRepository = (getStorage: () => Storage): MascotRepository => {
  let migrated = false;

  /** Runs `use` against storage, after the one-time legacy move, or returns `fallback` on any error. */
  const withStorage = <T>(fallback: T, use: (storage: Storage) => T): T => {
    try {
      const storage = getStorage();
      if (!migrated) {
        migrated = true;
        moveLegacySave(storage);
      }
      return use(storage);
    } catch {
      return fallback;
    }
  };

  return {
    list: async () =>
      withStorage([], storage => {
        const saved: SavedMascot[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key?.startsWith(PREFIX)) continue;
          const entry = parse(storage.getItem(key));
          if (entry) saved.push(entry);
        }
        return saved.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      }),
    get: async id => withStorage(null, storage => parse(storage.getItem(keyFor(id)))),
    save: async doc =>
      withStorage(undefined, storage => {
        const entry: SavedMascot = { doc, updatedAt: new Date().toISOString() };
        storage.setItem(keyFor(doc.id), JSON.stringify(entry));
      }),
    remove: async id => withStorage(undefined, storage => storage.removeItem(keyFor(id)))
  };
};

/** The studio's repository: this browser's localStorage. */
export const mascotRepository: MascotRepository = createLocalMascotRepository(
  () => window.localStorage
);

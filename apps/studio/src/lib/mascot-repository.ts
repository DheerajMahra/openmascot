import type { MascotDoc } from "@openmascot/embed";

/** A mascot as the library keeps it. Thumbnails are drawn from the doc, never stored (HLD S9). */
export interface SavedMascot {
  doc: MascotDoc;
  /** ISO time of the last save. */
  updatedAt: string;
}

/** The only way the studio reads or writes saved mascots. Phase 2 adds a remote implementation. */
export interface MascotRepository {
  /** Every saved mascot, newest first. */
  list: () => Promise<SavedMascot[]>;
  get: (id: string) => Promise<SavedMascot | null>;
  /** Creates or replaces the mascot with this doc's id and stamps updatedAt. */
  save: (doc: MascotDoc) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

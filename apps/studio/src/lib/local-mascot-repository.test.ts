import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalMascotRepository } from "@/lib/local-mascot-repository";
import { createBlankMascot } from "@/lib/mascot-store";

/** Just enough of the Web Storage API, backed by a Map. */
class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}

const mascot = (id: string, name = "Untitled") => ({ ...createBlankMascot(), id, name });

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-25T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("local mascot repository", () => {
  it("saves a mascot under its own key and reads it back", async () => {
    const repo = createLocalMascotRepository(() => storage);
    const doc = mascot("m_a");
    await repo.save(doc);

    expect(storage.getItem("openmascot:mascot:m_a")).not.toBeNull();
    expect(await repo.get("m_a")).toEqual({ doc, updatedAt: "2026-10-25T10:00:00.000Z" });
  });

  it("returns null for an id that isn't saved", async () => {
    const repo = createLocalMascotRepository(() => storage);
    expect(await repo.get("m_nope")).toBeNull();
  });

  it("replaces a mascot saved again and stamps the new time", async () => {
    const repo = createLocalMascotRepository(() => storage);
    await repo.save(mascot("m_a", "First"));
    vi.setSystemTime(new Date("2026-10-25T11:00:00.000Z"));
    await repo.save(mascot("m_a", "Second"));

    const saved = await repo.get("m_a");
    expect(saved?.doc.name).toBe("Second");
    expect(saved?.updatedAt).toBe("2026-10-25T11:00:00.000Z");
    expect(await repo.list()).toHaveLength(1);
  });

  it("lists every saved mascot, newest edit first", async () => {
    const repo = createLocalMascotRepository(() => storage);
    await repo.save(mascot("m_old"));
    vi.setSystemTime(new Date("2026-10-25T12:00:00.000Z"));
    await repo.save(mascot("m_new"));
    vi.setSystemTime(new Date("2026-10-25T11:00:00.000Z"));
    await repo.save(mascot("m_mid"));

    const ids = (await repo.list()).map(m => m.doc.id);
    expect(ids).toEqual(["m_new", "m_mid", "m_old"]);
  });

  it("removes a mascot", async () => {
    const repo = createLocalMascotRepository(() => storage);
    await repo.save(mascot("m_a"));
    await repo.save(mascot("m_b"));
    await repo.remove("m_a");

    expect(await repo.get("m_a")).toBeNull();
    expect((await repo.list()).map(m => m.doc.id)).toEqual(["m_b"]);
  });

  it("skips corrupt entries and ignores keys it doesn't own", async () => {
    storage.setItem("openmascot:mascot:m_bad", "{not json");
    storage.setItem("openmascot:mascot:m_shape", JSON.stringify({ hello: 1 }));
    storage.setItem("someone-else", JSON.stringify({ doc: mascot("m_x"), updatedAt: "x" }));
    const repo = createLocalMascotRepository(() => storage);
    await repo.save(mascot("m_ok"));

    expect((await repo.list()).map(m => m.doc.id)).toEqual(["m_ok"]);
    expect(await repo.get("m_bad")).toBeNull();
    expect(await repo.get("m_shape")).toBeNull();
  });

  it("works in memory only when storage is unavailable", async () => {
    const repo = createLocalMascotRepository(() => {
      throw new Error("SecurityError");
    });
    await expect(repo.save(mascot("m_a"))).resolves.toBeUndefined();
    expect(await repo.list()).toEqual([]);
    expect(await repo.get("m_a")).toBeNull();
    await expect(repo.remove("m_a")).resolves.toBeUndefined();
  });

  it("swallows a failed write", async () => {
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const repo = createLocalMascotRepository(() => storage);
    await expect(repo.save(mascot("m_a"))).resolves.toBeUndefined();
  });
});

/** Writes a save the way the previous version did: one doc plus its edit time. */
const legacy = (doc = mascot("m_legacy", "Old one"), edited = "2026-10-01T08:00:00.000Z") => {
  storage.setItem("openmascot:current", JSON.stringify(doc));
  storage.setItem("openmascot:edited", edited);
  return doc;
};

describe("moving the single saved mascot of the previous version", () => {
  it("turns it into one library entry and removes the old keys", async () => {
    const doc = legacy();
    const repo = createLocalMascotRepository(() => storage);

    expect(await repo.list()).toEqual([{ doc, updatedAt: "2026-10-01T08:00:00.000Z" }]);
    expect(storage.getItem("openmascot:current")).toBeNull();
    expect(storage.getItem("openmascot:edited")).toBeNull();
  });

  it("runs before the first get too", async () => {
    const doc = legacy();
    const repo = createLocalMascotRepository(() => storage);
    expect((await repo.get("m_legacy"))?.doc).toEqual(doc);
  });

  it("uses the current time when the old edit time is missing", async () => {
    storage.setItem("openmascot:current", JSON.stringify(mascot("m_legacy")));
    const repo = createLocalMascotRepository(() => storage);
    expect((await repo.get("m_legacy"))?.updatedAt).toBe("2026-10-25T10:00:00.000Z");
  });

  it("never overwrites an entry that already has that id", async () => {
    const repo = createLocalMascotRepository(() => storage);
    await repo.save(mascot("m_legacy", "Newer"));
    legacy(mascot("m_legacy", "Older"));

    const fresh = createLocalMascotRepository(() => storage);
    expect((await fresh.get("m_legacy"))?.doc.name).toBe("Newer");
    expect(storage.getItem("openmascot:current")).toBeNull();
  });

  it("drops an unreadable old save", async () => {
    storage.setItem("openmascot:current", "{broken");
    storage.setItem("openmascot:edited", "2026-10-01T08:00:00.000Z");
    const repo = createLocalMascotRepository(() => storage);

    expect(await repo.list()).toEqual([]);
    expect(storage.getItem("openmascot:current")).toBeNull();
    expect(storage.getItem("openmascot:edited")).toBeNull();
  });

  it("keeps the old keys when the move can't be written", async () => {
    legacy();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const repo = createLocalMascotRepository(() => storage);
    await repo.list();

    expect(storage.getItem("openmascot:current")).not.toBeNull();
    expect(storage.getItem("openmascot:edited")).not.toBeNull();
  });

  it("only runs once per repository", async () => {
    const repo = createLocalMascotRepository(() => storage);
    await repo.list();
    legacy();
    expect(await repo.list()).toEqual([]);
  });
});

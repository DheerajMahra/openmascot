import type { MascotDoc, TriggerType } from "openmascot";

import { buildTrigger, uniqueTrigger } from "@/lib/presets";

/*
 * Rules about a mascot document that don't depend on the editor: what names look like, how keys
 * are renamed and dropped, and which trigger a new row gets.
 */

/** What a mascot is called when its name is empty or only spaces. */
export const UNTITLED = "Untitled";

/** The move a mascot opens on: its first. */
export const firstSeq = (doc: MascotDoc): string => Object.keys(doc.sequences)[0] ?? "";

/** A copy of `obj` with key `from` renamed to `to`, keeping the key order. */
export const renameKey = <T>(
  obj: Record<string, T>,
  from: string,
  to: string
): Record<string, T> => {
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(obj)) out[k === from ? to : k] = v;
  return out;
};

/** A copy of `obj` without `key`. */
export const omitKey = <T>(obj: Record<string, T>, key: string): Record<string, T> => {
  const out = { ...obj };
  delete out[key];
  return out;
};

/** A move name as stored: lower case letters and digits joined by single "-". */
export const toMoveName = (name: string): string =>
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

/** "wave 1" for a pose made from "wave" (or from "wave 3"), or the next number up if that is taken. */
export const nextPoseName = (poses: Record<string, string>, from = "default"): string => {
  const base = from.replace(/ \d+$/, "").slice(0, 27) || "default";
  let n = 1;
  while (`${base} ${n}` in poses) n++;
  return `${base} ${n}`;
};

/** Every trigger key that plays this sequence, in table order. */
export const triggersFor = (doc: MascotDoc, seq: string): string[] =>
  Object.entries(doc.triggers)
    .filter(([, value]) => value === seq)
    .map(([key]) => key);

/** Trigger kinds a new row can take, tried in order until one is free. */
const TRIGGER_DEFAULTS: TriggerType[] = ["click", "hover", "load", "interval"];

/** The first trigger kind no row uses yet, or a fresh custom event. */
export const freeTriggerKey = (triggers: Record<string, string>): string => {
  for (const kind of TRIGGER_DEFAULTS) {
    const key = buildTrigger(kind, "");
    if (!(key in triggers)) return key;
  }
  return uniqueTrigger("custom", triggers);
};

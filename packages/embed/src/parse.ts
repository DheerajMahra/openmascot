import type { MascotDoc, MascotFrame } from "./types";

import { DEFAULT_TICK } from "./format";

/*
 * Mascot files arrive as untyped JSON: fetched by <open-mascot src>, read back from storage,
 * hand-edited. parseMascotDoc is the one place that decides whether such a value can be played.
 */

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSize = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

/**
 * Keeps the entries whose value passes `keep`. Built with Object.fromEntries, which defines own
 * properties: assigning `out[key]` would turn a move named "__proto__" into the map's prototype.
 */
const entries = <T>(value: unknown, keep: (item: unknown) => item is T): Record<string, T> => {
  if (!isObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, T] => keep(entry[1]))
  );
};

const isFrame = (value: unknown): value is MascotFrame =>
  isObject(value) && typeof value.pose === "string";

const isFrameList = (value: unknown): value is MascotFrame[] =>
  Array.isArray(value) && value.every(isFrame);

const isString = (value: unknown): value is string => typeof value === "string";

/**
 * A mascot document checked and brought up to date, or null when it can't be drawn.
 *
 * Required: a string `id`, a `grid` of positive whole numbers, a `palette` of strings and `poses`
 * as strings. Everything else falls back: no name reads as "", a missing or unusable `tick` as
 * the default, moves that aren't lists of frames and triggers that don't name a move are dropped.
 * Fields the runtime doesn't know are kept, so a newer studio's file survives a round trip.
 *
 * Migration: docs saved before moves stopped looping carry an "idle" trigger nothing reads; it
 * is dropped.
 */
export const parseMascotDoc = (value: unknown): MascotDoc | null => {
  if (!isObject(value)) return null;
  const { id, name, version, grid, tick, palette, poses } = value;
  if (typeof id !== "string") return null;
  if (!isObject(grid) || !isSize(grid.w) || !isSize(grid.h)) return null;
  if (!Array.isArray(palette) || !palette.every(isString)) return null;
  if (!isObject(poses) || !Object.values(poses).every(isString)) return null;

  const triggers = entries(value.triggers, isString);
  delete triggers.idle;

  return {
    ...value,
    id,
    name: typeof name === "string" ? name : "",
    version: typeof version === "number" ? version : 1,
    grid: { w: grid.w, h: grid.h },
    tick: typeof tick === "number" && Number.isFinite(tick) && tick > 0 ? tick : DEFAULT_TICK,
    palette,
    poses: poses as Record<string, string>,
    sequences: entries(value.sequences, isFrameList),
    triggers
  };
};

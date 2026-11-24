# ADR-002: A mascot is one self-contained JSON document

## Status

Accepted

## Date

2026-10-21

## Context

The product promise is "one script tag, one JSON file". A mascot must move unchanged between the
studio's local library, an exported file on someone's site, and, in later phases, a database and a
CDN. The format is the contract between the studio, the runtime and every site that embeds a mascot,
so changing it later is expensive.

## Decision

A mascot is a single `MascotDoc` (`packages/embed/src/types.ts`), and that document is the unit of
storage, export, embedding and sharing.

- **Poses are strings, one character per cell**, row by row. `.` is transparent; any other character
  is a base-36 index into `palette`. That caps a palette at 36 colors, which is plenty for pixel art.
- **The grid is fixed at 24 × 16.** `grid` stays in the document so the format describes itself, but
  there is no user-chosen size.
- **Palette entries are `#rrggbb`**, with no alpha; transparency is the `.` cell.
- **Sequences are lists of frames**: `pose`, `hold`, and optional `x` (columns right) and `y` (rows
  up from the floor; see [`docs/moves-xy-plane.svg`](../moves-xy-plane.svg)). Every sequence plays once, then the mascot rests on its
  `default` pose. There are no looping sequences; an `interval:<seconds>` trigger repeats a move.
- **Triggers are a map** from event key to sequence name: `load`, `click`, `hover`,
  `interval:<seconds>`, `custom:<name>`. One sequence per event.
- **Ids are created on the client** when a mascot is made and never change.
- **New optional fields don't break old readers.** The runtime ignores fields it doesn't know.

## Alternatives Considered

### Pose cells as arrays or run-length encoding

- Pros: no palette size cap.
- Cons: larger, harder to diff and read.
- Rejected because: a 24 × 16 pose is 384 characters and a whole mascot is a few KB as strings.

### Triggers as an array of rules

- Pros: several moves per event, per-trigger options such as cooldowns.
- Cons: more format and UI to build now.
- Deferred: if needed, it becomes a format version bump with a mechanical migration.

## Consequences

- Planned in `docs/hld.md` but not built yet: a `schema` field replacing the ambiguous `version`
  field, a validator, a `migrate()` function and a `packages/schema` package that owns the format.
  `packages/schema` is planned for phase 2; the version-field change should be settled then, before
  documents reach a database.
- Every breaking change to the format is a breaking change to the `openmascot` package and needs a
  migration for saved mascots.
- In phase 2 the document is stored whole (JSONB), with only the fields that are queried copied into
  columns.

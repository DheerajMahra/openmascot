# ADR-003: Ship the runtime as `openmascot`: a custom element and a React component

## Status

Accepted

## Date

2026-10-30

## Context

Before launch, the runtime found mascots by scanning the page for `data-mascot` attributes, and it was
named `@openmascot/embed`. Sites add and remove content after load, React apps render on the server,
and most users will install from npm or paste a CDN script.

## Decision

- Publish the runtime to npm as **`openmascot`** (the monorepo root became `openmascot-monorepo`).
- On plain pages, mascots are an **`<open-mascot>` custom element** that mounts when it enters the
  page and cleans up when it leaves. The CDN script (`cdn.jsdelivr.net/npm/openmascot@0`) registers the
  element and `window.Mascot`. The `data-mascot` scan is removed.
- React apps use **`<Mascot>` from `openmascot/react`**. React 19 drops object and boolean props on
  custom elements during hydration, so the component passes `doc` and `triggers` through a ref
  callback, which also makes it work with server rendering.
- Page code calls `emit()` or `play()`, optionally with `{ to: name }` to reach one mascot.
- The package is built two ways: `tsc` output (JavaScript plus types) for npm, and a minified IIFE
  `dist/embed.js` from esbuild for the CDN. `publishConfig` swaps the exports to `dist/` at publish
  time, so the monorepo keeps importing `src/`.

## Alternatives Considered

### Keep the `data-mascot` scan

- Cons: a scan at load misses mascots added later and never cleans up removed ones.
- Rejected because: the custom element's lifecycle handles both.

### Keep the scoped name `@openmascot/embed`

- Rejected because: the short unscoped name is easier to install and matches the product. The exact
  reasoning wasn't recorded.

## Consequences

- The CDN snippet follows `openmascot@0`, so every 0.x release reaches existing script-tag users. The
  release workflow purges jsDelivr's cache for that range after each publish.
- Breaking changes need care even on 0.x for script-tag users, who can't pin through a lockfile.
- React is an optional peer dependency; plain-page users never download it.

# ADR-001: Use a pnpm monorepo with a framework-free runtime package

## Status

Accepted

## Date

2026-10-10

## Context

OpenMascot has two halves that change together:

- a runtime that draws a mascot on other people's websites, where every byte and dependency is paid
  for by someone else's page;
- a studio app where mascots are made, which previews everything through that same runtime so what
  you see is what ships.

A third consumer, the landing site, arrived later and also renders mascots through the runtime.

## Decision

One pnpm workspace:

| Path               | Package               | Role                                                                                             |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------ |
| `packages/embed`   | `openmascot` (npm)    | The runtime. No runtime dependencies; React is an optional peer used only by `openmascot/react`. |
| `packages/samples` | `@openmascot/samples` | Clawd and Moss, typed as `MascotDoc`, shared by studio and site.                                 |
| `apps/studio`      | `@openmascot/studio`  | The editor, a Next.js app.                                                                       |
| `apps/site`        | `@openmascot/site`    | The landing page.                                                                                |

Apps depend on the runtime with `workspace:*` and import its TypeScript source directly; only the
published package uses the built `dist/` (see [ADR-003](003-ship-runtime-as-custom-element-and-react-component.md)).

The studio was scaffolded fresh with `create-next-app` rather than copied from an earlier project.

## Alternatives Considered

### Separate repositories for runtime and studio

- Pros: independent histories and CI.
- Cons: a runtime change and the studio change that uses it would need two PRs and a publish in
  between.
- Rejected because: the studio previews through the runtime, so the two are developed in lockstep.

### Runtime code inside the Next.js app

- Pros: one package, no workspace setup.
- Cons: the runtime would be shaped by the app's framework and couldn't be published on its own.
- Rejected because: the runtime must ship zero framework weight to host pages.

## Consequences

- `packages/embed` stays free of React and Next code. React, JSX and Next lint rules are scoped to
  `apps/**` in `.oxlintrc.json`.
- The runtime's size and dependency count are visible product promises (the README says about 3 KB
  gzipped, no dependencies), so adding a dependency there needs a strong reason.
- Shared mascot data lives in a package, not copied between apps.

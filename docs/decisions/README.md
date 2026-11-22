# Architecture Decision Records

Why OpenMascot is built the way it is. Each record captures one decision: the context, what was
chosen, what else was considered and what follows from it.

| ADR                                                              | Decision                                                   | Status   | Scope         |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | -------- | ------------- |
| [001](001-pnpm-monorepo-with-framework-free-runtime.md)          | Use a pnpm monorepo with a framework-free runtime package  | Accepted | repo, embed   |
| [002](002-mascot-is-one-json-document.md)                        | A mascot is one self-contained JSON document               | Accepted | embed, studio |
| [003](003-ship-runtime-as-custom-element-and-react-component.md) | Ship the runtime as a custom element and a React component | Accepted | embed         |

These three were written after the fact, from commit messages and the high-level design doc that
was removed in `1cbd93d`. Where the original reasoning was never written down, the ADR says so.

## Writing a new ADR

1. Copy [`template.md`](template.md) to the next number, for example `004-short-title.md`.
2. Fill it in with status **Proposed** and open a pull request. Discuss the decision there.
3. Set the status to **Accepted** when it merges, and add a row to the table above.
4. To change an accepted decision, write a new ADR. Set the old one's status to
   "Superseded by ADR-NNN"; don't rewrite the rest of it.

Write an ADR when a change picks a framework, data store, auth approach, public API or file format
shape, or hosting platform, or when it would be expensive to undo. Library upgrades and code style
don't need one. There is one log for the whole monorepo; the Scope column says which apps and
packages a decision touches.

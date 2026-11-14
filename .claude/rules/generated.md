---
paths:
  - 'packages/**'
---

# Generated packages

- `src/generated/` is written by `pnpm generate` only: `types/` and `validators/` by orval from
  `openapi/`, `events/` by `scripts/generate-events.mjs` from `asyncapi/`.
- `tests/codegen/generated/` is the same code for the documents of `tests/redocly/valid/`; it is
  committed, compiled by `pnpm typecheck` and never edited either.
- `packages/contracts/specs/` is written by the build and not committed.
- Authored code (enumerations, helpers) lives outside `generated/` and is exported explicitly.

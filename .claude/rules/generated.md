---
paths:
  - 'packages/**'
---

# Generated packages

Follow the [generation map](../../docs/architecture.md#what-a-spec-becomes) and use
`pnpm generate` for `src/generated/` and `tests/codegen/generated/`. Commit the generated
fixtures for `tests/redocly/valid/` and check them with `pnpm typecheck`.
`packages/contracts/specs/` is a build output and stays out of Git. Keep authored
enumerations and helpers outside generated trees with explicit exports.

## Review example

When a generated type and a spec disagree, verify the owning spec first. Regenerate with `pnpm generate`. Review
the generated diff for unrelated changes and use the package checks documented in `AGENTS.md`.

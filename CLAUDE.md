# cadenway-api-contracts: Claude Code instructions

> **Source of truth.** This file is the entry point for Claude Code. The normative rules live in
> [AGENTS.md](AGENTS.md), imported below: read it, do not paraphrase it from memory.

@AGENTS.md

> **Read on demand, deliberately not `@`-imported**: the [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), section "Modèle de données affiché", the [repositories document](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N), sections "Services NestJS" and "cadenway-api-contracts". Importing them would
> cost context in every session. The path-scoped rules in `.claude/rules/` load automatically when
> you open a matching file and carry the few things that must never be got wrong there.

## TL;DR for every task

This checkout is being bootstrapped. The structure, generation and CI below describe the target;
check the actual files and scripts before relying on them, and report unavailable checks.

1. This repository is the only definition of public routes (`openapi/public/`), internal routes (`openapi/internal/`) and events (`asyncapi/`).
2. Specs come first; `@cadenway/contracts` (types, event names, validators, enumerations) and `@cadenway/api-client` are generated from them and never edited by hand.
3. Additive change = minor; removal or shape change = major with a deprecation period; an event changes shape by changing its versioned name.
4. Every spec file has an owner in CODEOWNERS: the team of the service that implements it.
5. CI lints (Redocly), detects breaking changes (oasdiff), regenerates and compiles the packages.

## Boundaries (hard rules)

- No implementation: no business logic, no server code.
- Generated folders are never edited by hand.
- Shared enumerations (statuses, categories, priorities, cancel reasons, recurrences) live here once; no other repository redefines them.

## Target quality gate

Once the scripts exist, run the narrowest check first. `/cw-quality` stops at the first failure
and reports missing scripts as unavailable.

```bash
pnpm format:check
pnpm test:lint
pnpm lint:code
pnpm lint:specs                # Redocly
pnpm breaking                  # oasdiff against main
pnpm generate
pnpm typecheck
pnpm test:architecture
pnpm test
pnpm build
pnpm changeset status
```

## Tooling: this repository ships its own `.claude/`

Open `cadenway-api-contracts/` as the workspace root to activate it. The `cw-contracts-*` agents, the `/cw-*`
commands, the skills and the hooks are described in [.claude/README.md](.claude/README.md). Two things
the session listing does not tell you:

- **Rules** in `.claude/rules/` load at session start unless they declare `paths`. Scoped rules
  load when Claude reads a matching file.
- **Hooks** cover the edit and shell tool events matched in `.claude/settings.json`.
  `guard.mjs` refuses edits that break a hard rule
  (generated trees, lockfiles, secrets, sibling checkouts, hand edits of generated packages, unpinned third-party actions and `pull_request_target` in workflows), `guard-git.mjs`
  refuses pushes to `main`, tag pushes, force-pushes, rewrites of pushed commits, hook bypasses and
  registry publishing, and `format.mjs` formats supported files when its formatter is available.
  Apply the repository rules across tools. Resolve a refusal without bypassing the hook.

The sibling repositories (`../cadenway-api-gateway`, `../cadenway-task-service`, `../cadenway-webapp`, `../cadenway-service-kit`) are read-only references
from here; add them to the session (`--add-dir`) when a task needs to read them.

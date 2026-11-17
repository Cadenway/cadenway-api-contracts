# cadenway-api-contracts: agent instructions

These shared instructions apply to every assistant. Explicit user instructions take precedence over
procedures within the hard limits below. Claude Code imports this file through [CLAUDE.md](CLAUDE.md).

## First read

- Before editing, read the spec, its CODEOWNERS entry and consumers listed in `x-consumers`.
  The team that implements the spec owns its CODEOWNERS entry.
- Consult "Modèle de données affiché" in the
  [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et) and "Services NestJS" or
  "cadenway-api-contracts" in the
  [repositories document](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N) when relevant.
- Read `package.json` for versions and scripts. Avoid restating versions.

## What this repository is

This repository is the sole source for public and internal OpenAPI routes and AsyncAPI events.
It publishes `@cadenway/contracts` and `@cadenway/api-client` from the specs. Use the
[ownership map](docs/architecture.md#architectural-ownership) for authored sources, shared
components and enumerations, generated trees and tooling.

## Language

- Everything written in the repository is **English**: code, comments, docs, agent prompts, rules,
  skills, commit messages, branch names, PR titles and descriptions.
- Follow the user's language in the conversation only. No emojis.
- Never invent facts about the product, the contracts, the mockup or the tooling: cite the file or
  the document. When something does not exist yet, say so and say which step of the start-up plan
  brings it.

## Architectural ownership

- Change the spec first. Use `cw-contract-style` for OpenAPI and AsyncAPI and
  `cw-versioning-rules` before non-additive changes. The
  [versioning rules](docs/integration.md#versioning-rules) cover compatible additions, deprecation
  before breaking changes and new names for incompatible event versions.
- Generate `@cadenway/contracts` types, event names and validators and the `@cadenway/api-client`
  from their sources. CI checks Redocly lint, compatibility, generation and compilation. See
  [what a spec becomes](docs/architecture.md#what-a-spec-becomes).
- After release, implement compatible changes in the producing service, then the gateways and
  listeners, then the webapp. Each step only adds, so each repository ships alone.

## Boundaries (hard rules)

- No implementation: no business logic, no server code.
- Generated folders are never edited by hand.
- Shared enumerations (statuses, categories, priorities, cancel reasons, recurrences) live here once; no other repository redefines them.

## GitHub files (`.github/`)

Keep this repository's [README](.github/README.md), community files, templates, code owners and
complete workflows in `.github/`. Cadenway has no organization-level files, cross-repository
reusable workflows or shared Renovate preset. Use the paired `github.md` rules when editing
GitHub files. Apply changes to shared material through separate pull requests in each owner.

## Code quality

- Read the affected entry point, its callers, and its relevant tests before editing.
  Preserve the behavior callers rely on unless the task changes it.
- Keep the diff focused. Use names that express intent and reuse existing code when
  it preserves the required behavior. Extract code when it clarifies a responsibility.
- Keep business decisions with their owning module. Validate external inputs at the
  boundary and use documented public interfaces across modules and repositories.
- For writes that can fail, overlap, or be retried, verify the resulting state.
  Check transaction boundaries, tenant scope, and repeated delivery where relevant.
- For collections and repeated work, check what grows with input size. Measure or
  inspect the bottleneck before adding an index, cache, worker, or replica.
- Run the repository checks that cover the affected behavior. Report the commands
  and their results, including checks that did not run and tests that selected zero cases.

## Commands and quality gates

Start with the smallest check that covers the change. See the
[full local gate](docs/development.md#full-local-quality-gate) for the repository-wide sequence.

| Changed                         | Minimum check                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| A spec                          | `pnpm lint:specs`, `pnpm breaking`, `pnpm generate`, `pnpm typecheck` |
| Shared enumerations             | `pnpm test`, `pnpm build`                                             |
| Any change to a package         | a changeset                                                           |
| Docs or agent instructions only | Scoped formatting and link review                                     |

`pnpm breaking` compares OpenAPI and AsyncAPI with the local `origin/main` ref, falling back to
`main` when the remote-tracking ref is absent. An incompatible event change uses a new
versioned name while the previous version stays available.

## Git and branch flow

Use the paired `git-and-commits.md` rule for trunk-based branches, Conventional Commits and
staging only task files. Validate branch names with `git check-ref-format --branch <name>`.

Pull requests target `main` and are squash-merged after review and green CI. Each PR adds a
changeset. The Version Packages PR bumps versions and its merge publishes both packages in CI.
Renovate opens consumer update PRs. See [collaboration and release](docs/development.md#collaboration-and-release).

## Hard limits (never without the user's explicit request in this conversation)

- Never push to `main`, merge into it locally, create or push Git tags, or bump a version by hand.
- Never run a registry publish (`npm publish`, `pnpm publish`): the release workflow publishes.
- Never force-push, and never amend or rebase commits that are already pushed.
- Never bypass the Git hooks (`--no-verify`, `core.hooksPath` overrides, `ALLOW_MAIN_PUSH=1`,
  `CW_SKIP_PUSH_CHECKS=1`).
- Never write a token, password or private key anywhere; `.npmrc` keeps `${NODE_AUTH_TOKEN}`. Do
  not read or write secret environment files; new variables are documented in `.env.example`.
- Never edit generated trees (`dist/`, `node_modules/`, `coverage/`, `packages/*/src/generated/`) or lockfiles by hand.
- Never modify a sibling checkout (`../cadenway-*`) from a task in this repository.
- Never merge a breaking change without a major changeset and a deprecation already shipped.

The agent hooks enforce most of these mechanically; a refused command is a signal to stop and ask,
not to find another way around it.

## Agent tooling

Use the [Claude](.claude/README.md#agents) or [Codex](.codex/README.md) guide for specialists,
commands, skills, scoped rules and hooks. Read the active assistant's matching rules for every
touched path and load skills relevant to the task. Specialists are available when needed.
Give each delegate a bounded assignment, owning checkout, explicit files and checks. Keep
parallel write scopes disjoint and integrate the results.

## Repository hygiene

- Reuse existing commands, tools and test infrastructure before adding files.
- Prefer inline commands or a task-specific temporary directory for one-off diagnostics; clean up
  disposable files before delivery.
- Keep a permanent script only when it provides a reusable capability that existing tooling cannot.
- Add permanent tests for meaningful behavior or regressions, in the existing test structure.
- Before delivery, inspect untracked files and remove only the disposable artifacts of the current
  task. Report every new permanent tooling file and why it needs to stay.
- Report material failures, skipped checks and limitations, including non-blocking ones. Ask for
  user input only when a missing decision or authorization blocks the dependent work.

## References

Use the [documentation index](docs/README.md#sources-and-policy) for the mockup, integration
guide and repositories document.

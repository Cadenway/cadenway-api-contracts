# Development and verification

[Documentation index](README.md) · [Repository overview](../.github/README.md) · [Repository instructions](../AGENTS.md)

## Bootstrap status

The scripts below exist in `package.json`; `pnpm quality` runs them in order, except `pnpm changeset status`. Run Git, pnpm, build and test commands with this repository as the working directory, never from the parent workspace. `openapi/` and `asyncapi/` hold no contract yet, so the generation, the typecheck and the tests run on the documents of `tests/redocly/valid/`.

## Before making a change

- The spec file you change and its CODEOWNERS entry.
- The consumers listed in the spec header (`x-consumers`).
- The data model of the [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et).
- `package.json` for versions and scripts once the repository is bootstrapped. Do not restate
  versions elsewhere: a copy goes stale.

## Planned setup

Requirements: Node.js LTS and pnpm (versions in `package.json`).

```bash
pnpm install
pnpm build
```

Consumers install the published packages; never link this folder into another repository.

## Minimum checks by change

The scripts below are this repository's contract. While the repository is being bootstrapped,
create them with these exact names; afterwards, use them and never an ad-hoc equivalent. Run the
narrowest check that covers the change first, then widen:

| Changed                         | Minimum check                                                         |
| ------------------------------- | --------------------------------------------------------------------- |
| A spec                          | `pnpm lint:specs`, `pnpm breaking`, `pnpm generate`, `pnpm typecheck` |
| Shared enumerations             | `pnpm test`, `pnpm build`                                             |
| Any change to a package         | a changeset                                                           |
| Docs or agent instructions only | Scoped formatting and link review                                     |

Report the commands you actually ran and their results; a check you did not run is reported as not
run.

## Full check list

The following commands are the local gate. Run `/cw-quality` in Claude Code or `$cw-quality` in
Codex without arguments. CI runs the same steps and fails when `pnpm generate` leaves a diff.

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

## What each command covers

| Command           | Does                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint:specs` | Redocly on `openapi/`, `asyncapi/`, `components/` and `tests/redocly/valid/`                                                                                                                                                                                                   |
| `pnpm breaking`   | oasdiff between the OpenAPI documents of the working tree and `origin/main` (`--base <ref>` for another commit), like the CI job: composed mode, failure on `ERR`. Skipped while the base holds no spec. Uses `oasdiff` from the PATH, else its container image through Docker |
| `pnpm generate`   | `generate:clean`, `generate:openapi` (orval), `generate:events`; the result is committed                                                                                                                                                                                       |
| `pnpm typecheck`  | the two packages, the tests, and `tests/codegen/generated/` with the compiler options of each package                                                                                                                                                                          |
| `pnpm test`       | the Redocly rules, the generators, the generated fixture code, the enumerations                                                                                                                                                                                                |
| `pnpm build`      | both packages; the build of `@cadenway/contracts` also writes `packages/contracts/specs/`                                                                                                                                                                                      |

**Events have no automated breaking-change check.** oasdiff reads OpenAPI only, here and in CI. A change to an event payload is caught by review (`/cw-breaking-review`) and by the rule that anything but an added optional member takes a new versioned event name.

## Collaboration and release

- Trunk-based: work branches come from `main`, named `<type>/<lowercase-kebab-description>` with a
  type among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`; put the Cadenway task id first when there is one (`feat/cad-482-sso-screen`). Never an
  agent name as a prefix. Validate with `git check-ref-format --branch <name>`.
- Commits and PR titles follow Conventional Commits: `type(scope): subject`, English, imperative,
  lowercase subject, no trailing period, at most 100 characters; `!` only for a breaking change.
- Pull requests target `main` and are squash-merged after review and green CI. Changesets: each PR adds a changeset; the "Version Packages" pull request bumps versions; its merge publishes both packages from CI, and Renovate opens update PRs in every consumer.
- Stage only the files of your task; preserve other people's changes in the working tree.

Keep credentials, private keys, decrypted environment files and Terraform state out of documentation and logs. Follow the hard limits in [AGENTS.md](../AGENTS.md); setup instructions do not authorize deployments or changes to real infrastructure.

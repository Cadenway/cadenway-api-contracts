# Development and verification

[Documentation index](README.md) · [Repository overview](../.github/README.md) · [Repository instructions](../AGENTS.md)

## Bootstrap status

The local gate uses the scripts in `package.json`. Run Git, pnpm, build and test commands with this repository as the working directory, never from the parent workspace. The generation, the typecheck and the tests run on the contracts of `openapi/` and `asyncapi/` and on the documents of `tests/redocly/valid/`.

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

Use the [checks by change in AGENTS.md](../AGENTS.md#commands-and-quality-gates) to select and report the smallest applicable verification.

## Full local quality gate

Run these steps from the repository root. The same procedure backs `/cw-quality` in Claude Code
and `$cw-quality` in Codex.

1. Run `pnpm quality`. The script in `package.json` runs formatting, lint-rule tests, code and
   spec linting, compatibility checks, generation, type checks, architecture checks, tests, build,
   and package archive verification.
2. Run `pnpm changeset status` when checking a change to a published package.

`generate:openapi` runs Orval followed by `scripts/postprocess-validators.mjs`. The postprocessor
reads dereferenced operations to parse boolean query strings, applies strict empty-body validators
only where new operations opt in with `x-cadenway-strict-empty`, and corrects the documented
Unicode-length, milestone and bulk-action validators. Published empty-body validators retain their
existing behavior until a major release.

The gate regenerates tracked contract files. Review the generated diff against the intended spec
change. CI requires the committed generated files to match regeneration.

## What each command covers

| Command           | Does                                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint:specs` | Redocly on `openapi/`, `asyncapi/`, `components/` and `tests/redocly/valid/`                                                                                                          |
| `pnpm breaking`   | OpenAPI and AsyncAPI compared with `origin/main` (`--base <ref>` for another commit). OpenAPI uses oasdiff in composed mode with failure on `ERR`, from the PATH or its Docker image. |
| `pnpm generate`   | `generate:clean`, `generate:openapi` (orval and postprocessor), `generate:events`; the result is committed                                                                            |
| `pnpm typecheck`  | the two packages, the tests, and `tests/codegen/generated/` with the compiler options of each package                                                                                 |
| `pnpm test`       | the Redocly rules, the generators, the generated fixture code, the enumerations                                                                                                       |
| `pnpm build`      | both packages; the build of `@cadenway/contracts` also writes `packages/contracts/specs/`                                                                                             |

The AsyncAPI check compares the events of the working tree with the same base commit as oasdiff.
It protects the event name, subject, restriction and payload schema, and tests authored payload
examples against the baseline and candidate validators. An added optional field is compatible when
the old validator strips unknown fields. A closed schema needs a new event version for the addition.
Run `node scripts/breaking.mjs --events-only --base <ref>` to check AsyncAPI independently.

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

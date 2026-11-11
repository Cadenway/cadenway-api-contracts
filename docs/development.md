# Development and verification

[Documentation index](README.md) · [Repository overview](../.github/README.md) · [Repository instructions](../AGENTS.md)

## Bootstrap status

At the time this documentation was written, this checkout has no `package.json`, application source tree, or GitHub workflow files. The target architecture, scripts, and workflows in this guide must be created and verified during bootstrap.

The commands below are the documented **target workflow**, copied from the repository overview and instructions. They are not proof that scripts, infrastructure, CI, or dependencies currently exist. Inspect the repository's actual manifests and files before running them, and report unavailable checks rather than inventing replacements. Run Git, pnpm, build, and test commands with this repository as the working directory, never from the parent workspace.

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

| Changed                 | Minimum check                                                         |
| ----------------------- | --------------------------------------------------------------------- |
| A spec                  | `pnpm lint:specs`, `pnpm breaking`, `pnpm generate`, `pnpm typecheck` |
| Shared enumerations     | `pnpm test`, `pnpm build`                                             |
| Any change to a package | a changeset                                                           |
| Docs or agent instructions only | Scoped formatting and link review |

Report the commands you actually ran and their results; a check you did not run is reported as not
run.

## Planned full check list

The following commands match the planned local gate. Run `/wp-quality` in Claude Code or
`$wp-quality` in Codex without arguments. Verify CI coverage once workflows exist.

```bash
pnpm format:check
pnpm lint:specs                # Spectral
pnpm breaking                  # oasdiff against main
pnpm generate
pnpm typecheck
pnpm test
pnpm build
pnpm changeset status
```

## Collaboration and release

- Trunk-based: work branches come from `main`, named `<type>/<lowercase-kebab-description>` with a
  type among `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`,
  `revert`; put the Waypoint task id first when there is one (`feat/way-482-sso-screen`). Never an
  agent name as a prefix. Validate with `git check-ref-format --branch <name>`.
- Commits and PR titles follow Conventional Commits: `type(scope): subject`, English, imperative,
  lowercase subject, no trailing period, at most 100 characters; `!` only for a breaking change.
- Pull requests target `main` and are squash-merged after review and green CI. Changesets: each PR adds a changeset; the "Version Packages" pull request bumps versions; its merge publishes both packages from CI, and Renovate opens update PRs in every consumer.
- Stage only the files of your task; preserve other people's changes in the working tree.

Keep credentials, private keys, decrypted environment files and Terraform state out of documentation and logs. Follow the hard limits in [AGENTS.md](../AGENTS.md); setup instructions do not authorize deployments or changes to real infrastructure.

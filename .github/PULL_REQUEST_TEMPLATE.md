<!--
Title: Conventional Commits, for example `feat(tasks): add sprint burndown`. It becomes the squash
commit on main. See .github/CONTRIBUTING.md.
-->

## Task

Fixes: CAD-

<!-- Use `Refs: CAD-…` instead when this pull request does not complete the task. -->

## Summary

<!-- What changes and why, in a few lines. -->

## Checks run

<!-- Tick what you ran locally. A check you did not run stays unticked, with the reason. -->

- [ ] `pnpm format:check`
- [ ] `pnpm lint:specs`
- [ ] `pnpm breaking`
- [ ] `pnpm generate`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm changeset status`

## Contracts

- [ ] Additive change only (`pnpm breaking` reports nothing)
- [ ] Breaking change, as a new versioned route or event; both are documented while consumers move
- [ ] Emitter and consumers listed for every new event

## Release

- [ ] Changeset added (`pnpm changeset`)
- [ ] Public API unchanged, or deprecated before removal
- [ ] No release needed (docs, tests, CI only)

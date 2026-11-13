---
name: cw-tech-pnpm
description: "Work with pnpm packages, dependencies, scripts, or workspaces in a Cadenway checkout."
---

# Pnpm for Cadenway

Run pnpm only from the owning checkout, after inspecting its manifest and scripts. Respect that each repository has its own lockfile and release process; never use `file:`, `link:`, `npm link`, sibling source aliases, or manually edit a lockfile. Do not publish or tag from an agent shell. Use existing workspace commands and report missing scripts during bootstrap rather than inventing them.

A version must be two days old before pnpm resolves it (`minimumReleaseAge`), a version that loses the provenance or the trusted publisher of an earlier one is refused (`trustPolicy: no-downgrade`), and an install script runs only when `allowBuilds` lists it. A refused package is replaced, not excepted. The packages set aside for Cadenway are banned by the `no-restricted-imports` rule of the ESLint configuration, where the repository has one; adding a dependency that is not declared yet is an architecture decision.

Consult the official documentation for the version actually used: https://pnpm.io/workspaces.

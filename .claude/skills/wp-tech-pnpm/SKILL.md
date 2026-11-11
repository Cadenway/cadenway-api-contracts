---
name: wp-tech-pnpm
description: "Work with pnpm packages, dependencies, scripts, or workspaces in a Waypoint checkout."
---

# Pnpm for Waypoint

Run pnpm only from the owning checkout, after inspecting its manifest and scripts. Respect that each repository has its own lockfile and release process; never use `file:`, `link:`, `npm link`, sibling source aliases, or manually edit a lockfile. Do not publish or tag from an agent shell. Use existing workspace commands and report missing scripts during bootstrap rather than inventing them.

Consult the official documentation for the version actually used: https://pnpm.io/workspaces.

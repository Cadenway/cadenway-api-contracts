---
name: wp-tech-typescript
description: "Implement or review TypeScript code and package boundaries in a Waypoint repository."
---

# Typescript for Waypoint

Read the owning repository's `AGENTS.md`, existing TypeScript conventions, and package configuration before changing code. Follow strict typing and the project's actual compiler options; model unknown external data at boundaries and avoid unsafe casts and `any`. Preserve repository package boundaries: use published `@waypoint/*` packages rather than source aliases or sibling links. Do not hand-edit generated clients or lockfiles. Run the repository's targeted typecheck and tests when available.

Consult the official documentation for the version actually used: https://www.typescriptlang.org/docs/.

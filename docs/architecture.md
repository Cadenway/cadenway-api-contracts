# Architecture and ownership

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

## Status

At the time this documentation was written, this checkout has no `package.json`, application source tree, or GitHub workflow files. The target architecture, scripts, and workflows in this guide must be created and verified during bootstrap.

The following architecture is the target recorded in [AGENTS.md](../AGENTS.md). Paths and integrations are design boundaries, not evidence that files or services already exist.

## Purpose and target structure

waypoint-api-contracts is the common language of Waypoint: what the API gateway exposes, what each service exposes internally, and what the services say to each other. It publishes `@waypoint/contracts` and `@waypoint/api-client`, generated from the specs.

```text
openapi/public/      ← one file per domain (tasks.yaml, billing.yaml…)
openapi/internal/    ← one file per service (task-service.yaml…)
asyncapi/            ← one file per emitting service
packages/contracts/  → @waypoint/contracts
packages/api-client/ → @waypoint/api-client (generated)
```

Implementation order after a release: producing service, then gateways and listening services, then the webapp. Each step only adds, so each repository ships alone.

## Architectural ownership

- `openapi/` and `asyncapi/`: authored specs.
- `packages/contracts/src/enums/`: authored shared enumerations.
- `packages/*/src/generated/`: generated, never edited.

## Boundaries

- No implementation: no business logic, no server code.
- Generated folders are never edited by hand.
- Shared enumerations (statuses, categories, priorities, cancel reasons, recurrences) live here once; no other repository redefines them.

## Cross-repository changes

Each checkout owns its implementation and release. Use published `@waypoint/*` packages instead of sibling source imports or local dependency links. For contract changes, make the contract and generated package available first, then update the producing service, gateways and listeners, and finally the webapp. Each step should remain deployable independently.

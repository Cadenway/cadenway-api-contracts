# cadenway-api-contracts documentation

Planned role: cadenway-api-contracts is the common language of Cadenway: what the API gateway exposes, what each service exposes internally, and what the services say to each other. It publishes `@cadenway/contracts` and `@cadenway/api-client`, generated from the specs.

## Current status

The tooling exists and runs: lint, generation, breaking-change check, build and CI. No Cadenway contract has been authored yet: `openapi/` and `asyncapi/` are empty, and the packages publish the shared enumerations only.

## Read the guides

- [Architecture and ownership](architecture.md): boundaries and planned repository structure.
- [Development and checks](development.md): prerequisites, planned commands and verification.
- [Domain and integration](integration.md): repository-specific contracts, behavior and dependencies.

## Sources and policy

- [Repository overview](../.github/README.md) and [contribution guide](../.github/CONTRIBUTING.md).
- [Repository instructions and hard limits](../AGENTS.md).
- [Claude Code instructions](../CLAUDE.md) and [tooling](../.claude/README.md).
- [Codex tooling](../.codex/README.md).
- [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), and [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N).

Repository instructions take precedence over this summary. Refer to the actual package manifests, implementation, specifications, and workflows once they exist; do not infer a deployed feature from a target design.

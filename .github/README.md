# cadenway-api-contracts

cadenway-api-contracts is the common language of Cadenway: what the API gateway exposes, what each service exposes internally, and what the services say to each other. It publishes `@cadenway/contracts` and `@cadenway/api-client`, generated from the specs.

```text
openapi/public/      ← one file per domain (tasks.yaml, billing.yaml…)
openapi/internal/    ← one file per service (task-service.yaml…)
asyncapi/            ← one file per emitting service
components/          ← what the specs share by `$ref` (problem, pagination, actor)
packages/contracts/  → @cadenway/contracts
packages/api-client/ → @cadenway/api-client (generated)
```

Implementation order after a release: producing service, then gateways and listening services, then the webapp. Each step only adds, so each repository ships alone.

## Getting started

Requirements: Node.js LTS and pnpm (versions in `package.json`).

```bash
pnpm install
pnpm build
```

Consumers install the published packages; never link this folder into another repository.

## Checks

Run the narrowest check first; CI runs them all on every pull request.

```bash
pnpm format:check
pnpm lint:specs                # Redocly
pnpm breaking                  # oasdiff against main
pnpm generate
pnpm typecheck
pnpm test
pnpm build
pnpm changeset status
```

## Contributing

- [Contributing guide](CONTRIBUTING.md): branches, commits, pull requests, releases.
- [Code of conduct](CODE_OF_CONDUCT.md), [security policy](SECURITY.md), [getting help](SUPPORT.md).
- AI assistants follow [AGENTS.md](../AGENTS.md); Claude Code also reads [CLAUDE.md](../CLAUDE.md) and the
  tooling described in [.claude/README.md](../.claude/README.md).

## License

This repository is proprietary. See [LICENSE](../LICENSE) for the rights and restrictions that apply.

## References

- [Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE): every screen, state and interaction.
- [Integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et): tokens, data shapes, component names.
- [Repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N): what each repository owns, deployment.

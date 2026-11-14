---
paths:
  - 'asyncapi/**'
---

# AsyncAPI specs

- Names `<entity>.<past-tense-fact>.v<n>`; payload with `id`, `occurredAt`, `organizationId`, `actor`,
  the entity ids and the changed fields.
- A non-additive change creates `.v<n+1>`; both are documented while consumers move.
- List the emitter and consumers in each channel.
- AsyncAPI 3.0.0 exactly: `pnpm generate:events` refuses any other version.
- The payload also carries `version`, the version of the aggregate: a consumer ignores a version it
  has already applied.
- `actor` is `{ type: 'user' | 'automation' | 'git' | 'system', id }`, referenced from
  `components/events.yaml`, never copied.
- The payload declares `properties` and `required` itself, without `allOf`: a member may be a `$ref`,
  the envelope may not. The generator refuses a keyword it cannot turn into a validator.
- No tool compares events with `main`: `pnpm breaking` and the CI job read OpenAPI only. A changed
  payload is caught by review (`/cw-breaking-review`) and by the rule above on versioned names.
- The address of a channel is the subject `evt.<name>`.

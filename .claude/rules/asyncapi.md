---
paths:
  - 'asyncapi/**'
---

# AsyncAPI specs

- Names `<entity>.<past-tense-fact>.v<n>`; payload with `id`, `occurredAt`, `organizationId`, `actor`,
  the entity ids and the changed fields.
- A non-additive change creates `.v<n+1>`; both are documented while consumers move.
- List the emitter and consumers in each channel.
- AsyncAPI 3.0.0 exactly: the model generator does not read 3.1.0 and writes one untyped `Root`
  model without failing.
- The payload also carries `version`, the version of the aggregate: a consumer ignores a version it
  has already applied.
- `actor` is `{ type: 'user' | 'automation' | 'git' | 'system', id }`.
- The address of a channel is the subject `evt.<name>`.

---
paths:
  - 'asyncapi/**'
---

# AsyncAPI specs

- Names `<entity>.<past-tense-fact>.v<n>`; payload with `id`, `occurredAt`, `organizationId`, `actor`,
  the entity ids and the changed fields.
- A non-additive change creates `.v<n+1>`; both are documented while consumers move.
- List the emitter and consumers in each channel.

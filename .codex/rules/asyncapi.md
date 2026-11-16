---
paths:
  - 'asyncapi/**'
---

# AsyncAPI specs

- Names `<entity>.<past-tense-fact>.v<n>`; payload with `id`, `occurredAt`, `organizationId`, `actor`,
  the entity ids and the changed fields.
- An incompatible change creates `.v<n+1>`; both are documented while consumers move.
- List the emitter and consumers in each channel.
- AsyncAPI 3.0.0 exactly: `pnpm generate:events` refuses any other version.
- The payload also carries `version`, the version of the aggregate: a consumer ignores a version it
  has already applied.
- `actor` is `{ type: 'user' | 'automation' | 'git' | 'system', id }`, referenced from
  `components/events.yaml`, never copied.
- The payload declares `properties` and `required` itself, without `allOf`: a member may be a `$ref`,
  the envelope may not. The generator refuses a keyword it cannot turn into a validator.
- `pnpm breaking` and pull request CI compare published event names, subjects, restricted flags and
  payload schemas with `main`. An optional addition is compatible when the old validator drops
  unknown fields. A closed schema rejects the new field. Added constraints on a previously
  unrestricted field also require a new version when the old validator preserved that field.
- Authored message payload examples are checked with the old and new generated validators.
- The address of a channel is the subject `evt.<name>`. A message that carries a secret (a single-use
  code) is marked `x-cadenway-restricted: true` and its channel is `restricted.<name>`: the stream
  `EVENTS_RESTRICTED`, read by notification-service only. The generated module lists those events in
  `RESTRICTED_EVENT_NAMES`, the `restrictedEvents` of `@cadenway/nest-messaging`.

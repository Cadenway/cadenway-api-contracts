---
paths:
  - 'asyncapi/**'
---

# AsyncAPI specs

Use `cw-contract-style` and the [event rules](../../docs/integration.md#events) for AsyncAPI 3.0.0,
subjects, aggregate versions and schema keywords. List emitters and consumers. Name events
`<entity>.<past-tense-fact>.v<n>`. Include `id`, `occurredAt`, `organizationId`, `actor`,
`version`, entity ids and changed fields. Reference `actor` from `components/events.yaml`.
Declare `properties` and `required` on the payload itself, without `allOf`. A member may be a
`$ref`, the envelope may not.

Run `pnpm breaking` to compare event names, subjects, restricted flags and payload schemas with
the baseline used by CI. Check authored payload examples against both generated validators.
An optional addition is compatible when the old validator drops unknown fields. Closed schemas
reject the new field. New constraints on an unrestricted field require a new version when the
old validator preserved it. Keep both versions documented while consumers migrate.

Restricted secret-bearing events use `x-cadenway-restricted: true`, `restricted.<name>` and
`EVENTS_RESTRICTED`, read only by notification-service. The generator exposes these events as
`RESTRICTED_EVENT_NAMES` for the `restrictedEvents` option of `@cadenway/nest-messaging`.

## Review example

For example, renaming a payload field requires a new event version. Check both versions with the
generated validators and identify which consumers still need the old version before removing it.

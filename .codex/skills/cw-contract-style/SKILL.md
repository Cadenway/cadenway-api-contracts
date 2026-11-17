---
name: cw-contract-style
description: "Write or review Cadenway API and event specs. Covers naming, types, pagination and errors."
---

# Contract style

| Concern | Rule |
| --- | --- |
| Fields | camelCase |
| Ids | strings; tasks use the space prefix (`CAD-482`); every other entity id is a UUID v7 |
| Dates | ISO 8601; dates without time as `YYYY-MM-DD` |
| Lists | cursor pagination, `limit` ≤ 100 |
| Errors | `application/problem+json` (RFC 9457): `type`, `title`, `status`, `detail`, `instance`, with the extensions `code` and `details`; `code` stable and documented |
| Partial aggregates | `partial: string[]` naming the missing parts |
| Enumerations | `StatusKey`, `StatusCategory`, `MilestoneStatusKey`, `PriorityKey`, `CancelReason`, `Recurrence`; a response value set that will grow is `x-extensible-enum`, since oasdiff grades a value added to a response `enum` as breaking |
| Shared components | `components/http.yaml` (problem schema and response, `cursor`, `limit`, `nextCursor`) and `components/events.yaml` (`actor`), referenced by a relative `$ref` and never copied into a spec |

Read the matching section of the local integration guide before writing or reviewing a spec.

- For OpenAPI, read [HTTP API](../../../docs/integration.md#http-api).
- For AsyncAPI, read [Events](../../../docs/integration.md#events). Run `pnpm breaking` for the
  compatibility check.
- For lint coverage or fixture examples, read
  [Checked by pnpm lint:specs](../../../docs/integration.md#checked-by-pnpm-lintspecs).

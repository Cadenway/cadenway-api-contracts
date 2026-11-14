# Domain and integration

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

**Status:** This page records the target design from repository instructions and skills. Its behavior has not been verified as implemented in this snapshot.

## Change sequence

Author the contract in this repository first. After a compatible release of the generated packages, update the producing service, then gateways and listening services, then the webapp. The files and packages are planned until they exist; do not modify generated output by hand.

## Contract Style

Source: `cw-contract-style` ([Claude](../.claude/skills/cw-contract-style/SKILL.md), [Codex](../.codex/skills/cw-contract-style/SKILL.md)).

| Concern            | Rule                                                                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fields             | camelCase                                                                                                                                                      |
| Ids                | strings; tasks use the space prefix (`CAD-482`); every other entity id is a UUID v7                                                                            |
| Dates              | ISO 8601; dates without time as `YYYY-MM-DD`                                                                                                                   |
| Lists              | cursor pagination, `limit` ≤ 100                                                                                                                               |
| Errors             | `application/problem+json` (RFC 9457): `type`, `title`, `status`, `detail`, `instance`, with the extensions `code` and `details`; `code` stable and documented |
| Partial aggregates | `partial: string[]` naming the missing parts                                                                                                                   |
| Enumerations       | `StatusKey`, `StatusCategory`, `MilestoneStatusKey`, `PriorityKey`, `CancelReason`, `Recurrence`                                                               |

### HTTP API

| Concern           | Rule                                                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec version      | OpenAPI 3.1, without `$dynamicRef` or `components.pathItems`: oasdiff does not resolve them                                                                                             |
| Paths             | `/v1/...` in `openapi/public/`, `/internal/v1/...` in `openapi/internal/`; resources are plural and kebab-case; the organization is never in the path, it comes from the verified token |
| Verbs             | `POST` answers 201 with `Location`; `PATCH` is a JSON Merge Patch (RFC 7396); `DELETE` answers 204; an action is a sub-resource                                                         |
| Error statuses    | 400, 401, 403, 404, 409, 412, 422, 429, 503 and no other                                                                                                                                |
| Error codes       | `<domain>.<reason>`, each part in kebab-case                                                                                                                                            |
| Problem members   | `type`, `title`, `status` and `code` are required, `detail`, `instance` and `details` declared; every error response uses the one shared schema                                         |
| Cursor            | opaque; it encodes the sort key, the `id` and a fingerprint of the filters; `limit` defaults to 50; `nextCursor` is `null` on the last page                                             |
| Sort and filters  | `sort=-dueDate`; several values separated by commas; an unknown parameter answers 400                                                                                                   |
| Concurrent writes | each aggregate carries a `version`, returned as `ETag`; `If-Match` is optional, mandatory on long texts; a collection inside an aggregate changes through sub-resources                 |
| Idempotency       | `Idempotency-Key` (IETF draft 08): the key sent again with another body answers 422, a request still running 409; the response is replayed for 24 h                                     |
| Rate limit        | `RateLimit` and `RateLimit-Policy` response headers (IETF draft 11)                                                                                                                     |
| Deprecation       | `Deprecation` (RFC 9745) and `Sunset` (RFC 8594) response headers                                                                                                                       |
| Limits            | JSON body of 1 MB at most; 10 s budget per public route                                                                                                                                 |
| Units             | UTC instants with `Z`; whole minutes; cents with an ISO 4217 currency; bytes; BCP 47 language tags; IANA time zones                                                                     |
| Error reference   | `X-Request-Id` response header, shown by the web application                                                                                                                            |

### Events

| Concern      | Rule                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Spec version | AsyncAPI 3.0.0 exactly: the model generator does not read 3.1.0 and writes one untyped `Root` model without failing |
| `version`    | the version of the aggregate, in every event; a consumer ignores a version it has already applied                   |
| `actor`      | `{ type: 'user' \| 'automation' \| 'git' \| 'system', id }`                                                         |
| Subject      | `evt.<name>`, the address of the channel                                                                            |
| Trace        | `traceparent` (W3C Trace Context), in HTTP and in the message headers                                               |

### Checked by `pnpm lint:specs`

`redocly.yaml` enables the rules in `rules/contracts-redocly.mjs`; the rest is reviewed. The documents of
`tests/redocly/valid/` pass every rule and show the expected shapes.

| Rule                                                                                                      | Checks                                                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `cadenway/openapi-version`, `cadenway/openapi-no-dynamic-ref`, `cadenway/openapi-no-path-items-component` | OpenAPI 3.1 and the two constructs oasdiff does not resolve                                                               |
| `cadenway/path-prefix-public`, `cadenway/path-prefix-internal`                                            | `/v1/` and `/internal/v1/`, by folder                                                                                     |
| `cadenway/path-kebab-case`, `cadenway/path-no-organization`                                               | kebab-case segments, camelCase path parameters, no organization parameter                                                 |
| `cadenway/path-plural-collection`                                                                         | warning only: a segment followed by a path parameter ends with `s`                                                        |
| `cadenway/error-status`, `cadenway/error-problem-json`, `cadenway/problem-schema`                         | the allowed error statuses, the media type and the members of the problem                                                 |
| `cadenway/pagination-no-offset`, `cadenway/pagination-limit`, `cadenway/pagination-cursor`                | no page or offset parameter; `limit` from 1 to 100, 50 by default; `cursor`, `limit` and a nullable `nextCursor` together |
| `cadenway/asyncapi-version`                                                                               | AsyncAPI 3.0.0                                                                                                            |
| `cadenway/event-channel-address`, `cadenway/event-name`                                                   | `evt.<entity>.<fact>.v<n>` and `<entity>.<fact>.v<n>`                                                                     |
| `cadenway/event-payload`                                                                                  | `id`, `occurredAt`, `organizationId`, `actor`, `version` required; the four actor types; an integer `version`             |

## Versioning Rules

Source: `cw-versioning-rules` ([Claude](../.claude/skills/cw-versioning-rules/SKILL.md), [Codex](../.codex/skills/cw-versioning-rules/SKILL.md)).

| Change                                                                             | Level                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------- |
| New route, new optional field, new enumeration value consumers can ignore          | minor                                 |
| Description, example                                                               | patch                                 |
| Removed or renamed field or route, new required input, narrowed type, changed code | major, after a deprecation in a minor |
| Event payload change other than an added optional field                            | new versioned event name              |

## References

[Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), and [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N). Use [AGENTS.md](../AGENTS.md) as the local source for ownership and hard limits.

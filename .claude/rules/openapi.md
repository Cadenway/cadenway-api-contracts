---
paths:
  - 'openapi/**'
---

# OpenAPI specs

- `public/`: what the gateway exposes, with scopes. `internal/`: what each service exposes to the gateway.
- camelCase fields, ISO 8601 dates, string ids (`CAD-482` for tasks), cursor pagination
  (`cursor`, `limit`, `nextCursor`), errors as `application/problem+json` (RFC 9457) from one shared
  schema, with a stable `code` and `details`.
- OpenAPI 3.1, without `$dynamicRef` or `components.pathItems`: oasdiff does not resolve them.
- Paths start with `/v1/` in `public/` and `/internal/v1/` in `internal/`; resources are plural and
  kebab-case; the organization is never in the path.
- The cursor is opaque, `limit` defaults to 50 and `nextCursor` is `null` on the last page.
- An aggregate carries a `version`, returned as `ETag`; `If-Match` is optional, mandatory on long texts.
- `Idempotency-Key`: 422 when the key comes back with another body, 409 while the first request runs.
- `pnpm lint:specs` checks what Redocly can; the `cw-contract-style` skill holds the whole table.
- Reuse components; enumerations are referenced from the shared schemas.
- Examples use mockup data.

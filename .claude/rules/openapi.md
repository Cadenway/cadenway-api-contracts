---
paths:
  - 'openapi/**'
---

# OpenAPI specs

Use `cw-contract-style` and the [HTTP API rules](../../docs/integration.md#http-api) for OpenAPI 3.1,
paths, field types, pagination, concurrency, idempotency, security and errors. Public paths belong to
the gateway and internal paths to services. Each public operation declares security. A route without
`apiToken` refuses personal API tokens. Check the
[Redocly coverage](../../docs/integration.md#checked-by-pnpm-lintspecs) with `pnpm lint:specs`.

Use shared schemas for enumerations and relative references to `components/http.yaml` for the
problem schema and response, `cursor`, `limit` and `nextCursor`. A spec may declare its own
error responses for code examples or headers such as `Retry-After` and `Set-Cookie`; each uses the
shared problem schema. Keep shared components outside `openapi/`. Use `x-extensible-enum` for
response values that can grow and use mockup data in examples.

## Review example

For example, adding a required request field can reject requests from an older client. Run
`pnpm lint:specs` and the existing breaking-change check, then inspect whether old requests and
consumer handling of responses still work.

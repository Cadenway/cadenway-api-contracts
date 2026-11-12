---
paths:
  - 'openapi/**'
---

# OpenAPI specs

- `public/`: what the gateway exposes, with scopes. `internal/`: what each service exposes to the gateway.
- camelCase fields, ISO 8601 dates, string ids (`CAD-482` for tasks), cursor pagination
  (`cursor`, `limit`, `nextCursor`), one `Error` schema with a stable `code`.
- Reuse components; enumerations are referenced from the shared schemas.
- Examples use mockup data.

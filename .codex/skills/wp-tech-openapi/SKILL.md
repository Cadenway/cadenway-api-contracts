---
name: wp-tech-openapi
description: "Author, review, generate, or consume Waypoint OpenAPI specifications and HTTP contracts."
---

# Openapi for Waypoint

Specifications are authored in `waypoint-api-contracts`; services implement internal routes and the API gateway owns public routing. Inspect the relevant existing specification, ownership and consumers before making contract changes. Preserve stable errors, scopes, examples, versioning and additive compatibility according to the repository rules. Never hand-edit generated types or clients. Run the owning repository's specified lint, breaking-change, generation and type checks when available; ship contract before implementation and consumers.

Consult the official documentation for the version actually used: https://spec.openapis.org/.

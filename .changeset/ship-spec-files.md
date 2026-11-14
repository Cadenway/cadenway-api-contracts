---
'@cadenway/contracts': minor
---

Ship the specs in the package, under `@cadenway/contracts/specs/<kind>/<spec>.yaml` (`<kind>` is
`openapi` or `asyncapi`). Each file is self-contained: what the spec takes from the shared
components is copied into it, so a service can generate its own client for another service from the
published contract with the default options of its generator.

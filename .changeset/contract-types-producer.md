---
'@cadenway/contracts': minor
---

Give `@cadenway/contracts/types/<spec>` a producer: every OpenAPI document now yields one module of
TypeScript types, one per schema and per parameter set (`Task`, `Problem`, `ListTasksParams`). The
validators stay per operation, with the schemas inlined and without the error responses, so they do
not replace these types.

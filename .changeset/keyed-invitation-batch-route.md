---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Add `POST /internal/v1/invitation-batches` for keyed invitation batches, so a rollback to a release without replay support answers 404 instead of running a keyed retry as a fresh batch.

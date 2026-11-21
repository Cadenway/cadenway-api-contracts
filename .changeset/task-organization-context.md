---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Document the optional organization precondition for task detail and updates, including a distinct error when the active organization changes. Task detail reads are private and non-cacheable and no longer return HTTP 304. The ETag remains available for conditional writes.

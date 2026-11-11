---
name: wp-tech-asyncapi
description: "Author, review, generate, or consume Waypoint AsyncAPI event contracts."
---

# Asyncapi for Waypoint

Start with the emitting service's specification in `waypoint-api-contracts`, its consumers, and existing versioning rules. Document event names, payloads and compatibility; preserve versioned event identities and avoid assuming delivery is exactly once. Connect contract changes to the service outbox and subscriber idempotency without directly editing generated artifacts. Run the contract and integration checks actually available and coordinate producer before listeners.

Consult the official documentation for the version actually used: https://www.asyncapi.com/docs/.

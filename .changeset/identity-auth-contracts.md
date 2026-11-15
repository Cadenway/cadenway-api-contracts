---
'@cadenway/contracts': minor
---

Add the first domain contracts, those of identity-service: `types/public/auth` and
`validators/public/auth` for the public authentication routes (sign-in method discovery, sign-up,
email verification, sign-in by password or by email code, sign-out, `GET /v1/me`),
`types/internal/identity-service` and `validators/internal/identity-service` for the routes the API
gateway calls (the same flows, `POST /internal/v1/tokens/introspect`, session revocation, reading a
user), `events/identity-service` for `user.signed-up.v1`, `user.email-verified.v1`,
`session.revoked.v1` and the restricted `one-time-code.issued.v1`, and the three specs under
`specs/`.

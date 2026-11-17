---
'@cadenway/contracts': minor
---

Add the contracts of account security, first part: password change and reset, recent
re-authentication, open sessions, change of address and scheduled deletion of the account.

Public routes in `openapi/public/auth.yaml`, served by the API gateway through new internal routes
of identity-service: `POST /v1/auth/password-reset`, `/inspection` and `/confirmation` (anonymous,
the same answer whether or not the address has an account, 45 seconds between two links and 5 an
hour per address, a link of 30 minutes that never signs in and closes the sessions unless
`closeOtherSessions` is `false`), `POST /v1/auth/reauthentication` (a 10-minute window of recent
authentication per session), `PUT /v1/me/password`, `POST /v1/me/email-change` and
`/confirmation` (a 6-digit code to the new address), `POST /v1/me/deletion` (30 days, every session
and token revoked at once, the cookie cleared; a sign-in cancels it), `GET /v1/sessions`,
`DELETE /v1/sessions/{sessionId}` and `POST /v1/sessions/revoke-others`. New codes:
`auth.reset-throttled`, `auth.reset-link-expired`, `auth.password-incorrect`,
`auth.reauthentication-required`, `auth.email-unchanged`, `account.organization-owner`, and
`session.not-found` on the public side. The failed passwords of the re-authentication and the
password change count with the lockout of the sign-in. A pending change of address belongs to the
session that asked for it; a change or a reset of the password drops it and ends the recent
authentication of the other sessions. Only a `200` of a sign-in means signed in, ahead of the
`202` challenge that two-step verification will add. `CurrentUser` and the internal `User` gain
an optional `passwordChangedAt`, the sign-in answers an optional `deletionCancelled`.

Events in `asyncapi/identity-service.yaml`: the restricted `password-reset-link.issued.v1`, and
`user.password-changed.v1`, `user.email-changed.v1`, `session.opened-on-new-device.v1`,
`user.deletion-scheduled.v1`, `user.deletion-cancelled.v1` and `user.deleted.v1`, each carrying
what its security email shows and nothing secret except the restricted one. `RESTRICTED_EVENT_NAMES`
now lists `password-reset-link.issued.v1` too. The change of address reuses
`one-time-code.issued.v1` with the purpose `email-change`. `member.removed.v1` is also emitted, by
the system, for each membership of a deleted account.

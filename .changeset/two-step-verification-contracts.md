---
'@cadenway/contracts': minor
---

Add the contracts of account security, second part: two-step verification, the challenge of the
sign-ins, trusted devices and the authentication policy of an organization.

Public routes in `openapi/public/auth.yaml`, served by the API gateway through new internal routes
of identity-service:

- Two-step verification of the account (session only): `GET` and `DELETE /v1/me/two-step-verification`,
  `POST /v1/me/two-step-verification/authenticator-app/setup` and `/setup/confirmation` (TOTP secret
  and `otpauth://` URI returned once, 10 backup codes `XXXX-XXXX` returned once on the first setup),
  `POST /v1/me/two-step-verification/backup-codes/regenerate`,
  `POST /v1/me/two-step-verification/security-keys/registration`,
  `POST /v1/me/two-step-verification/security-keys` (`201`) and
  `DELETE /v1/me/two-step-verification/security-keys/{securityKeyId}` (WebAuthn). Every change that
  starts or removes something needs a recent authentication.
- The sign-ins `POST /v1/auth/sign-in` and `POST /v1/auth/sign-in/code/verification` answer `202`
  with a challenge and no cookie for an account with two-step verification, unless the browser
  carries the trusted device cookie `__Host-cw_trusted_device`; the challenge is read with
  `POST /v1/auth/sign-in/challenge/inspection` and answered with
  `/authenticator-app`, `/backup-code` or `/security-key` (after `/security-key/options`), whose
  `200` signs in and, with `trustDevice`, sets the device cookie for 30 days. Five wrong answers in a
  row lock the answers of the account for 15 minutes.
- `POST /v1/auth/reauthentication` accepts `code`, a code of the authenticator app, beside
  `password`, which becomes optional. Once an account has two-step verification, only a two-step
  proof opens the window of recent authentication: a password alone answers
  `403 auth.reauthentication-required`, `details.methods` is `[authenticator-app]` on every guarded
  route, and `PUT /v1/me/password` needs that proof beside the current password. An account without
  two-step verification keeps the password (`details.methods: [password]`).
- `OpenSession` gains an optional `inactivityTimeoutMinutes`.

`openapi/public/organizations.yaml`: `GET` and `PATCH /v1/organization/authentication-policy`
(owner and admins; a change needs a recent authentication), two-step verification required for
nobody, the owner and admins, or everyone, and the inactivity of the sessions, 1 hour, 12 hours,
7 days or 30 days. A person who must have two-step verification and has none gets
`403 organization.mfa-required` on the routes of that organization and when choosing it. `openapi/public/members.yaml`: `Member` gains an optional
`twoStepVerificationEnabled`, present for the owner and the admins (column "Deux étapes").

New codes: `auth.challenge-expired`, `auth.two-step-code-invalid`, `auth.security-key-refused`,
`auth.two-step-locked`, `auth.two-step-not-enabled`, `auth.two-step-setup-expired`,
`auth.security-key-limit-reached`, `auth.mfa-required-by-organization`,
`organization.mfa-required` and `security-key.not-found`.

Internal routes of identity-service: the challenge, the two-step verification of a user and the
authentication policy of the organization of the token; the internal sign-ins take an optional
`trustedDeviceToken` and answer `202` with the challenge; `SessionIssued` gains an optional
`trustedDevice`; both introspections gain an optional `withheldOrganization`. organization-service's
internal `Member` gains an optional `twoStepVerificationEnabled`.

Event in `asyncapi/identity-service.yaml`: `user.two-step-verification-changed.v1`, not restricted
(no secret travels in an event), for the security emails and the directory of organization-service.

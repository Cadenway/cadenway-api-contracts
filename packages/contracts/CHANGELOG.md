# @cadenway/contracts

## 0.7.0

### Minor Changes

- 64f34f9: Add the contracts of account security, first part: password change and reset, recent
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
  
  Creating a personal API token now requires a recent authentication, a tightening of behavior:
  `POST /v1/api-tokens` and `POST /internal/v1/api-tokens` answer
  `403 auth.reauthentication-required` (with `details.methods`) outside the 10-minute window, so a
  stolen session cannot mint a token that outlives the recovery of the account. The internal body
  gains an optional `sessionId`, which the gateway always sends: without it identity-service answers
  the same `403`. The schema stays compatible (`pnpm breaking` reports no breaking change), and no
  consumer ships token creation in the web application yet. A password reset or change keeps the
  existing tokens, so that integrations keep working.

## 0.6.0

### Minor Changes

- 735dbd1: Limit the invitation emails. `POST /v1/invitations/{invitationId}/resend` and
  `POST /internal/v1/invitations/{invitationId}/resend` answer `429 invitation.resend-throttled`, with
  `Retry-After` and `details.resendAvailableAt`, less than an hour after the last sending of the
  invitation (`sentAt`). An organization causes at most 100 invitation emails in any 24 hours, issues
  and resends together: `POST /v1/invitations` and `POST /internal/v1/invitations` refuse a batch that
  needs more than what remains as a whole with `429 invitation.daily-limit-reached`, with
  `Retry-After`, `details.remaining` and `details.nextAvailableAt`, and a resend with none left
  answers the same code. The API gateway derives `Retry-After` from `details`, as its internal client
  does not carry the headers of a problem. The public `429` responses keep `rate-limit.exceeded`. New
  types `InvitationBatchLimitedResponse` and `InvitationResendLimitedResponse` in
  `types/public/members` and `types/internal/organization-service`.
  
  The generated query validators now read a numeric query parameter from its text with `Number()`:
  `limit: '8'` passes as `8`, absent still gives `50`, and `'abc'`, `''`, `'0'`, `'101'` and `'8.5'`
  still fail. Text that `Number()` reads as a whole number from 1 to 100 now passes too, where the
  local conversions of the consumers accepted digits only: `' 8'`, `'+8'`, `'8.0'`, `'1e1'`,
  `'0x10'`. An empty `limit` now fails with `too_small` rather than `invalid_type`. A string
  parameter keeps its text, and an array parameter such as `role` still arrives as comma-separated
  text that the consumer splits. The type of these validators changes accordingly: their output is
  the same, the input of `limit` widens from `number` to `unknown`. A consumer can drop its own
  conversion of `limit` before the validator.
  
  Descriptions only: the organization `website` accepts only `http` and `https` URLs; the
  `organizationId` of `session.revoked.v1` is always `null` in this version; `member.removed.v1`, the
  API token introspection and the `organizationId` of an active session state what a removal then a
  new membership does; choosing the current organization again records it as the last choice; the
  cross-site rule of every public document matches the gateway (`POST`, `PUT` and `PATCH` need
  `Content-Type: application/json`, a bodiless `DELETE` passes on its `Origin`).

## 0.5.1

### Patch Changes

- 2a0cf4d: Use a shared OpenAPI component for the organization role while preserving the generated name and values.

## 0.5.0

### Minor Changes

- ea80263: Add the contracts that let a signed-up person enter the application. New
  `types/public/organizations`, `types/public/members` and `types/public/api-tokens` (and their
  `validators/`) for creating an organization, listing those of the caller, reading and updating the
  current one, choosing the current organization of the session, listing, reading, changing the role
  of and removing members, inviting by address with one outcome per address, listing, resending and
  revoking invitations, accepting and refusing those addressed to the caller, and creating, listing
  and revoking personal API tokens. New `types/internal/organization-service` and
  `validators/internal/organization-service` for the routes the API gateway calls, and
  `events/organization-service` for `organization.created.v1`, `organization.updated.v1`,
  `member.joined.v1`, `member.role-changed.v1`, `member.removed.v1` and `invitation.issued.v1`
  (not restricted).
  
  identity-service gains, additively: `PATCH /v1/me` and `PATCH /internal/v1/users/{userId}` with the
  profile members `displayName`, `jobTitle` and `timeZone` (now also in `CurrentUser` and `User`),
  `PUT /internal/v1/sessions/{sessionId}/organization`, the personal API token routes,
  `POST /internal/v1/api-tokens/introspect` for a bearer personal token, a session introspection that
  fills `organizationId`, `role` and `scopes`, and `user.profile-updated.v1`. The three profile
  members are required in the public `CurrentUser` and optional in the internal `User` for this
  release, so that the API gateway can take this version before identity-service sends them (it then
  answers `null`, `null` and `Europe/Paris`).
  
  Every public operation now declares its own `security`: the session cookie, and `apiToken` with the
  scope a personal API token needs (`members:read` on the member reads); the routes of `auth.yaml` stay
  session only and gain `403 auth.api-token-not-accepted` and `401 auth.api-token-invalid`.

## 0.4.0

### Minor Changes

- bdccdc5: Bind the sign-up verification to the password of the sign-up, so that signing up an unverified
  address again with another password can no longer take over the account its owner verifies.
  `POST /v1/auth/sign-up/verification` and `POST /internal/v1/auth/sign-up/verification` take a new
  `SignUpVerification` body with an optional `password`, which the web application always sends:
  once the code is right, a `password` that differs from the one of the latest sign-up, or a missing
  one after the address was signed up more than once, answers the new
  `422 auth.sign-up-replaced` (`SignUpVerificationRefusedResponse`) and the code stops working. This
  deliberately refuses a request that was accepted before, a code without `password` after a repeated
  sign-up, as a security fix: the schema change itself is additive. The API gateway must forward
  `password` and accept `auth.sign-up-replaced` before identity-service requires `password`.
  `POST /v1/auth/sign-in/code/verification` keeps `CodeVerification`. The descriptions of
  `auth.code-throttled` now state that sign-up and sign-in code requests share the per-address
  throttle (30 seconds between two, at most 5 in an hour), and the internal sign-up `name` states its
  trimming rule.

## 0.3.1

### Patch Changes

- d0be0f3: Declare `403 auth.csrf-rejected` on every public auth route that changes state, signed in or not, as
  the gateway checks the `Origin` and `Content-Type` of all of them; sign-in lists it beside
  `auth.email-not-verified`. The bad-request examples show `details.issues[].path` as the dotted string
  the kit emits.

## 0.3.0

### Minor Changes

- 93cf3ae: Add the first domain contracts, those of identity-service: `types/public/auth` and
  `validators/public/auth` for the public authentication routes (sign-in method discovery, sign-up,
  email verification, sign-in by password or by email code, sign-out, `GET /v1/me`),
  `types/internal/identity-service` and `validators/internal/identity-service` for the routes the API
  gateway calls (the same flows, `POST /internal/v1/tokens/introspect`, session revocation, reading a
  user), `events/identity-service` for `user.signed-up.v1`, `user.email-verified.v1`,
  `session.revoked.v1` and the restricted `one-time-code.issued.v1`, and the three specs under
  `specs/`.
- 93cf3ae: Every module of `@cadenway/contracts/events/<spec>` now exports `RESTRICTED_EVENT_NAMES` and
  `RestrictedEventName`: the events whose message is marked `x-cadenway-restricted: true`, published on
  `restricted.<name>` in `EVENTS_RESTRICTED`. Pass the list as `restrictedEvents` to the
  `MessagingModule` of `@cadenway/nest-messaging`; it is empty for a document without restricted events.

## 0.2.0

### Minor Changes

- 9250b31: Give `@cadenway/contracts/types/<spec>` a producer: every OpenAPI document now yields one module of
  TypeScript types, one per schema and per parameter set (`Task`, `Problem`, `ListTasksParams`). The
  validators stay per operation, with the schemas inlined and without the error responses, so they do
  not replace these types.
- 9250b31: Generate `@cadenway/contracts/events/<spec>` from the AsyncAPI documents: for each event its name
  (`TASK_UPDATED_V1`), the type of its payload (`TaskUpdatedV1`) and the zod validator of that payload
  (`taskUpdatedV1Schema`), then `EVENT_NAMES`, `EventName`, `EventPayloads` and `eventSchemas` to reach
  the three by event name. A validator drops the members it does not know, so an event that gains an
  optional member is still read by a consumer built on the previous version.
- 9250b31: Export the shared enumerations from the package root, as a list of values and its type:
  `STATUS_KEYS` / `StatusKey`, `STATUS_CATEGORIES` / `StatusCategory` with `STATUS_CATEGORY_BY_KEY`,
  `MILESTONE_STATUS_KEYS` / `MilestoneStatusKey`, `PRIORITY_KEYS` / `PriorityKey`, `CANCEL_REASONS` /
  `CancelReason` and `RECURRENCES` / `Recurrence`. The values are the keys of the mockup data model.
- 9250b31: Ship the specs in the package, under `@cadenway/contracts/specs/<kind>/<spec>.yaml` (`<kind>` is
  `openapi` or `asyncapi`). Each file is self-contained: what the spec takes from the shared
  components is copied into it, so a service can generate its own client for another service from the
  published contract with the default options of its generator.

### Patch Changes

- 9250b31: Define the problem, the pagination members and the event actor once, in `components/`, for every spec
  to reference. Types, validators and shipped specs carry them as if they were written in each spec;
  no import path changes.

## 0.1.0

### Minor Changes

- bcc464d: Bootstrap both packages as empty shells. `@cadenway/contracts` declares its entry point and the
  `types/`, `validators/` and `events/` subpaths the generators fill; `@cadenway/api-client` is an
  empty Angular library. No route, event or enumeration is published yet.

# @cadenway/api-client

## 0.5.0

### Minor Changes

- 735dbd1: `InvitationsService.inviteMembers` and `InvitationsService.resendInvitation` document their new
  `429` codes, `invitation.daily-limit-reached` (`details.remaining`, `details.nextAvailableAt`) and,
  for the resend, `invitation.resend-throttled` (`details.resendAvailableAt`), each with
  `Retry-After`, beside `rate-limit.exceeded`. New exported types `InvitationBatchLimitedResponse` and
  `InvitationResendLimitedResponse`. Descriptions only elsewhere: the organization `website` accepts
  only `http` and `https` URLs, choosing the current organization again records it as the last choice,
  and removing a member states what happens to their tokens and sessions if they join again.

## 0.4.0

### Minor Changes

- ea80263: Export `OrganizationsService` (create an organization, list those of the caller, read and update
  the current one, choose the current organization of the session), `MembersService`,
  `InvitationsService` (invite, list, resend, revoke, and accept or refuse an invitation addressed to
  the caller) and `ApiTokensService`, with the types of their requests, results and problems, and
  `AuthService.updateCurrentUser` for the profile. `CurrentUser` gains `displayName`, `jobTitle` and
  `timeZone`. The generated enumerations `Role`, `AssignableRole`, `DefaultLanguage`,
  `OrganizationCreationTeamSize`, `OrganizationCreationPrimaryUse`, `ApiTokenScope`,
  `ApiTokenCreationExpiration` and `ProfilePatchLanguage` are exported as constants and types.

## 0.3.0

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

## 0.2.1

### Patch Changes

- d0be0f3: Declare `403 auth.csrf-rejected` on every public auth route that changes state, signed in or not, as
  the gateway checks the `Origin` and `Content-Type` of all of them; sign-in lists it beside
  `auth.email-not-verified`. The bad-request examples show `details.issues[].path` as the dotted string
  the kit emits.

## 0.2.0

### Minor Changes

- 93cf3ae: Export `AuthService`, the Angular client of the public authentication routes
  (`openapi/public/auth.yaml`), with the types of its requests, results and problems. The session
  travels in the `__Host-cw_session` cookie: the application sends its requests with credentials
  (`withCredentials`).

## 0.1.0

### Minor Changes

- bcc464d: Bootstrap both packages as empty shells. `@cadenway/contracts` declares its entry point and the
  `types/`, `validators/` and `events/` subpaths the generators fill; `@cadenway/api-client` is an
  empty Angular library. No route, event or enumeration is published yet.

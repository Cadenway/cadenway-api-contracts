# @cadenway/contracts

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

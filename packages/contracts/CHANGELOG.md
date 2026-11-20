# @cadenway/contracts

## 0.14.0

### Minor Changes

- 2b7ff63: Add an opt-in NDJSON response to the internal list task export so the gateway can prepare a CSV with bounded memory. Existing JSON callers and the public CSV contract keep their current representations.

## 0.13.1

### Patch Changes

- 3de7cb9: Align shared Problem response example titles in the goals, reports, list sprint report and intake contracts with their existing public error codes.

## 0.13.0

### Minor Changes

- a32ecd7: Add quarter-bound goals, key-result mutations and a team dashboard that projects only the caller's visible tasks.
- a32ecd7: Add list intake administration, revocable public forms with anonymous submission and opaque
  receipts, and editor access to the separately stored intake contact address.
- a32ecd7: Add sprint reports with explicit history coverage, list workload, weekly timesheets and list CSV export contracts.
  Define the organization-service name lookup used by the CSV export to render and sort visible assignees.

## 0.12.1

### Patch Changes

- faf0dc4: Align task time, custom field, approval, and onboarding error examples with the gateway's
  existing titles for their problem codes.

## 0.12.0

### Minor Changes

- 19d9b96: Add space custom field definitions, list-scoped reads and optional task custom field values.
  Allow saved sheet settings to reference custom columns by their stable field IDs.
- 19d9b96: Add caller-private first-launch wizard and checklist contracts, including idempotent space provisioning and the first-task marker.
- 19d9b96: Add task approval round reads, requests, votes, and withdrawals, plus the request and decision events.
- 19d9b96: Add task time entries with a readable creation location, time summaries and measured status
  durations. Mirror the six routes in the internal task-service API and expose the public client
  and validators.

## 0.11.0

### Minor Changes

- bc42c01: Add task comments, structured mentions, watchers, dependencies, milestones and recurrence; task
  and list duplication, atomic bulk actions, space templates, shared saved views and private
  favorites. Extend task detail and activity, publish the related collaboration facts, and keep
  restore readiness, access snapshots, archive metadata and empty request validation consistent.
  
  Strict validation of empty bodies on already published operations is deferred to the next major release.

## 0.10.0

### Minor Changes

- 4405442: Add the contracts of sharing, access requests, archives, the trash and deletions of the task core.
  
  Public routes, served by the API gateway through new internal routes of task-service; every read
  takes the scope `tasks:read`, every write `tasks:write`:
  
  - `openapi/public/access.yaml` (new): the grants of spaces and lists, `GET`, `PUT` and `DELETE`
    `/v1/spaces/{spaceId}/grants[/{userId}]` and `/v1/lists/{listId}/grants[/{userId}]` with the roles
    `edit`, `comment` and `view`, 200 grants at most; the access requests, `POST /v1/access-requests`
    (always `202` with no body, 500 characters of message, 10 per hour), `GET /v1/access-requests`
    and `POST /v1/access-requests/{accessRequestId}/approval` and `/refusal`.
  - `openapi/public/archives.yaml` (new): `POST /v1/lists/{listId}/archive` and `/unarchive`,
    `POST /v1/tasks/{taskKey}/archive` and `/unarchive` (a task with its subtree),
    `GET /v1/archives/lists` and `GET /v1/archives/tasks`.
  - `openapi/public/trash.yaml` (new): `POST /v1/tasks/{taskKey}/trash` (a task and its subtree as
    one entry), `GET /v1/trash/entries`, `POST /v1/trash/entries/{entryId}/restore`,
    `DELETE /v1/trash/entries/{entryId}` and `POST /v1/trash/empty`; entries are erased after 30 days.
  - `DELETE /v1/spaces/{spaceId}` and `DELETE /v1/lists/{listId}`: the space or the list disappears at
    once and its tasks reach the trash, one entry per top-level task.
  - The task routes answer `404 task.trashed` with the trash entry to whoever could change the list
    of a task in the trash, and `409 task.archived` to a change of an archived task; a caller who
    sees a list or a space without `edit` gets `403 access.role-insufficient`, and only the people
    who manage a space share it and delete it (`403 space.manage-forbidden`), as they alone already
    changed its visibility. Every member who saw a space before grants existed has `edit` on it, so
    nothing changes for them.
  - New optional members, so that an answer of an older task-service still reads: `callerRole` and
    `callerCanManage` on a space, `organizationAccess` (the switch "Accès de l’organisation"),
    `archivedAt`, `archivedBy` and `callerRole` on a list, `archivedAt` and `archivedBy` on a task;
    `organizationAccess` is an optional member of the creation and the patch of a list.
  
  Internal routes of `openapi/internal/task-service.yaml` for each of them, and
  `GET /internal/v1/lists/{listId}/access` and `GET /internal/v1/tasks/{taskKey}/access` for the
  issuer `realtime-gateway`.
  
  Events of `asyncapi/task-service.yaml`, none restricted, all on `evt.space.>`, `evt.list.>` and
  `evt.task.>`: `space.access-changed.v1`, `list.access-changed.v1`, `space.access-requested.v1`,
  `list.access-requested.v1`, `task.access-requested.v1`, `space.access-request-decided.v1`,
  `list.access-request-decided.v1`, `task.access-request-decided.v1`, `space.deleted.v1`,
  `space.restored.v1`, `list.archived.v1`, `list.unarchived.v1`, `list.deleted.v1`,
  `list.restored.v1`, `task.archived.v1`, `task.unarchived.v1`, `task.trashed.v1`,
  `task.restored.v1` and `task.purged.v1`, one per task of a subtree; `list.created.v1` gains an
  optional `organizationAccess`.

## 0.9.0

### Minor Changes

- 14a6209: Add the contracts of the task core: spaces, lists and sprints, tasks, subtasks, assignees, labels,
  checklists, activity logs, task queries, "Mes tâches" and the task part of "Accueil".
  
  Public routes, served by the API gateway through the new internal routes of task-service
  (`openapi/internal/task-service.yaml`); every read takes the scope `tasks:read`, every write
  `tasks:write`, and every creation an optional `Idempotency-Key`:
  
  - `openapi/public/spaces.yaml`: `POST` and `GET /v1/spaces`, `GET` and `PATCH /v1/spaces/{spaceId}`
    (name, prefix, description, icon and color from the mockup, visibility `organization` or
    `private`, statuses renamed or hidden by key), and `GET /v1/spaces/{spaceId}/overview?today=`
    (the lists of a space with the counts of their tasks). A creation also creates the list "Première
    liste". A prefix belongs for good to the space that used it; keys are never given again, and the
    space shows its next key as a preview.
  - `openapi/public/lists.yaml`: `POST` and `GET /v1/spaces/{spaceId}/lists`, `GET` and
    `PATCH /v1/lists/{listId}` (a sprint is a list with `sprint: { startDate, endDate, goal }`, the end
    on or after the start), `GET /v1/lists/{listId}/counts?today=` and
    `GET /v1/lists/{listId}/activity`.
  - `openapi/public/tasks.yaml`: `POST` and `GET /v1/lists/{listId}/tasks` (filters by status,
    priority, assignee with `me` and `none`, label, text, due range and level; sorts `manual`,
    `dueDate`, `priority`, `name` and `createdAt`, reversed with `-`),
    `GET /v1/lists/{listId}/task-groups` (counts by status, priority or assignee), `GET` and
    `PATCH /v1/tasks/{taskKey}` (status with its cancel reason, due and start dates, estimate in
    minutes, move and parent), `PUT` and `DELETE /v1/tasks/{taskKey}/assignees/{userId}`,
    `POST /v1/tasks/{taskKey}/labels/add` and `/labels/remove`, `GET /v1/tasks/{taskKey}/detail`
    (the aggregate the gateway composes, with `partial`), `GET` and
    `POST /v1/tasks/{taskKey}/subtasks`, `POST /v1/tasks/{taskKey}/checklist-items`,
    `PATCH /v1/tasks/{taskKey}/checklist-items/{checklistItemId}`,
    `GET /v1/tasks/{taskKey}/activity`, `GET /v1/labels`, `GET /v1/me/tasks` and
    `GET /v1/me/home?today=`.
  
  New codes: `space.not-found`, `space.prefix-taken`, `space.status-required`,
  `space.visibility-forbidden`, `list.not-found`, `list.sprint-dates-invalid`, `task.not-found`,
  `task.status-hidden`, `task.cancel-reason-required`, `task.cancel-reason-unexpected`,
  `task.assignee-invalid`, `task.assignee-limit-reached`, `task.label-limit-reached`,
  `task.start-date-invalid`, `task.list-invalid`, `task.parent-invalid`,
  `task.subtask-depth-exceeded`, `task.subtask-limit-reached`, `task.checklist-limit-reached`,
  `checklist-item.not-found`, `idempotency.key-reused` and `idempotency.request-in-progress`.
  
  The new shared file `components/task.yaml` holds the status keys and categories, the priorities
  and the cancel reasons of the shared enumerations, the resources the public and internal task
  routes share (`Space`, `TaskList`, `Task`, `TaskSummary`, `ActivityEntry` and their parts) and the
  query parameters of the task queries. The limits of the product bound the requests; the responses
  and the events state them in prose only.
  
  Events in `asyncapi/task-service.yaml`, none restricted, none consumed yet: `space.created.v1`,
  `space.updated.v1`, `list.created.v1`, `list.updated.v1`, `task.created.v1`, `task.updated.v1`,
  `task.status-changed.v1` and `task.assigned.v1`; a task is named by its `key` in every one.
  
  `asyncapi/organization-service.yaml`, descriptions only: task-service now consumes
  `member.joined.v1`, `member.role-changed.v1` and `member.removed.v1`, through
  `task-service__project-member-joined`, `task-service__project-member-role-changed` and
  `task-service__project-member-removed`.

## 0.8.0

### Minor Changes

- a199c87: Add the contracts of account security, second part: two-step verification, the challenge of the
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

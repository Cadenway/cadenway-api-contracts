# @cadenway/api-client

## 1.0.0

### Major Changes

- 2b69649: Add safe HTTP QUERY operations for filtered task lists, activity, reports and members. The Angular
  API client now requires Angular 22.3 or newer and uses its native HttpClient.query method.

## 0.32.0

### Minor Changes

- b5615dc: Deprecate support for Angular 22.0 through 22.2. A future major release will require Angular 22.3
  or newer. Upgrade Angular before adopting that release.

## 0.31.0

### Minor Changes

- b33f98e: Allow callers to pin space and board reads to their expected organization. Provide an internal
  task visibility batch for filtering automation run history.

### Patch Changes

- 37a78a6: Document when a confirmed rejection of the first Stripe creation request allows another Checkout
  attempt.

## 0.30.0

### Minor Changes

- b4802f4: Allow callers to pin the expected organization on task, attachment, intake contact, reminder, time, archive, trash, organization settings, and logo operations. Document private reads and distinguish a changed organization from a stale resource version.

## 0.29.0

### Minor Changes

- a47f0cf: Keep onboarding reads private and non-cacheable. Document the optional organization precondition
  for onboarding writes alongside the existing version precondition.

### Patch Changes

- a47f0cf: Document current membership checks for SAML, two-step sign-in, realtime ticket redemption,
  authentication policy mutation and delegated Task actions. Include internal temporary failures
  when authorization cannot be verified. Require Realtime to negotiate source membership support
  before redeeming a SAML session's ticket and document the visibility required to replay a task copy.
- a47f0cf: Document how Checkout recovers an earlier Stripe session and when Gateway rejects a request for CSRF.
- a47f0cf: Document invitation sending limits per account and organization, and the temporary upload quota
  for attachment reservations, including the draft limit per Intake publication. Describe reset
  link invalidation after a password change, acknowledgement of duplicate GitHub delivery digests
  and restrictions on widening visibility for spaces with private-source task templates.
- a47f0cf: Document single-use multipart upload tickets for task attachments, intake files and profile images.
  The reservation response keeps the existing POST method, URL, form fields and expiry. The Storage
  transfer operation consumes a ticket before writing its temporary object.
- a47f0cf: Define an Organization-only Identity operation to verify the current address used to authorize
  received invitations. Document the verification and temporary failure on the invitation routes.

## 0.28.0

### Minor Changes

- 4c49ecb: Document the optional organization precondition for task detail and updates, including a distinct error when the active organization changes. Task detail reads are private and non-cacheable and no longer return HTTP 304. The ETag remains available for conditional writes.

## 0.27.0

### Minor Changes

- 30e80ad: Add the federated browser sign-in contract for Google, GitHub, Microsoft, GitLab and SAML.

## 0.26.0

### Minor Changes

- 4e6dd5f: Add owner-only Team Checkout and invoice history contracts, and a raw signed Stripe webhook relay.

## 0.25.1

### Patch Changes

- fb1bb34: Define internal commands for automatic comments and inbox notifications. Task rechecks current
  rule-author authority and recipient visibility. The comment contract describes moderation of
  rule-authored comments.

## 0.25.0

### Minor Changes

- 9f66bfc: Define public and internal endpoints for support requests and newsletter sign-ups and expose the public Angular client.

## 0.24.0

### Minor Changes

- 393c0f0: Add the public and internal automation rule routes, the recent executions feed, and the `automation.executed.v1` event.
- 393c0f0: Define the internal Git and Automation task actions and expose the verified Git provider on activity actors when available.

## 0.23.0

### Minor Changes

- 7aa888c: Add the public and internal automation rule routes, the recent executions feed, and the `automation.executed.v1` event.

## 0.22.0

### Minor Changes

- cfb8b2f: Add the public and internal automation rule routes, the recent executions feed, and the `automation.executed.v1` event.

## 0.21.0

### Minor Changes

- 8583adf: Document the seat quota conflict for membership increases and the storage quota conflict for verified attachment uploads. Keep the existing problem format and omit usage details from anonymous Intake refusals.

## 0.20.0

### Minor Changes

- b29f638: Add the current organization billing subscription and usage contracts for seats, guests and verified attachments. Define the Billing source projections, the quota threshold event and the Organization authority for notification recipient lookup.

## 0.19.0

### Minor Changes

- fcbc77f: Add the organization-scoped command palette search contract for visible tasks and lists.

## 0.18.1

### Patch Changes

- 93ed57b: Match the public document precondition example and document the existing session transport errors.

## 0.18.0

### Minor Changes

- 4a69c7b: Add the public and internal Document operations, the current Task space access check, and versioned document lifecycle events.

## 0.17.0

### Minor Changes

- 5cde36f: Add signed upload and authorized read contracts for account avatars and organization logos. Define their verified PNG derivatives and versioned owner decisions for publication and abandoned upload cleanup.

## 0.16.0

### Minor Changes

- fb47723: Add private draft uploads to public intake, with additive form and submission fields, internal
  Task and Storage operations, and verified, claimed and released attachment events. Existing
  text-only submissions keep their request and receipt behavior.

## 0.15.0

### Minor Changes

- 9a61cc0: Define single-use realtime ticket issuance and redemption, with a verified task ID for authorized socket room joins.
  Add the Socket.IO receive and presence protocol and the Identity session organization-change fact.

## 0.14.0

### Minor Changes

- 256c417: Add personal inbox, notification preferences and task reminders to the public API and the corresponding notification-service contracts.
  Define the recipient-scoped notification creation and due reminder facts for current-visibility checks before delivery.
  Add the correlated Notification and Task facts for authorizing a deferred delivery.

## 0.13.0

### Minor Changes

- 754145e: Add signed upload and download contracts for task attachments and versioned storage lifecycle facts.

## 0.12.0

### Minor Changes

- a32ecd7: Add quarter-bound goals, key-result mutations and a team dashboard that projects only the caller's visible tasks.
- a32ecd7: Add list intake administration, revocable public forms with anonymous submission and opaque
  receipts, and editor access to the separately stored intake contact address.
- a32ecd7: Add sprint reports with explicit history coverage, list workload, weekly timesheets and list CSV export contracts.
  Define the organization-service name lookup used by the CSV export to render and sort visible assignees.

## 0.11.0

### Minor Changes

- 19d9b96: Add space custom field definitions, list-scoped reads and optional task custom field values.
  Allow saved sheet settings to reference custom columns by their stable field IDs.
- 19d9b96: Add caller-private first-launch wizard and checklist contracts, including idempotent space provisioning and the first-task marker.
- 19d9b96: Add task approval round reads, requests, votes, and withdrawals, plus the request and decision events.
- 19d9b96: Add task time entries with a readable creation location, time summaries and measured status
  durations. Mirror the six routes in the internal task-service API and expose the public client
  and validators.

## 0.10.0

### Minor Changes

- bc42c01: Add task comments, structured mentions, watchers, dependencies, milestones and recurrence; task
  and list duplication, atomic bulk actions, space templates, shared saved views and private
  favorites. Extend task detail and activity, publish the related collaboration facts, and keep
  restore readiness, access snapshots, archive metadata and empty request validation consistent.
  
  Strict validation of empty bodies on already published operations is deferred to the next major release.

## 0.9.0

### Minor Changes

- 4405442: Add the calls of sharing, access requests, archives, the trash and deletions. The new
  `AccessService` has `listSpaceGrants`, `setSpaceGrant`, `removeSpaceGrant`, `listListGrants`,
  `setListGrant` and `removeListGrant`; `AccessRequestsService` has `createAccessRequest`,
  `listAccessRequests`, `approveAccessRequest` and `refuseAccessRequest`; `ArchivesService` has
  `archiveList`, `unarchiveList`, `archiveTask`, `unarchiveTask`, `listArchivedLists` and
  `listArchivedTasks`; `TrashService` has `trashTask`, `listTrash`, `restoreTrashEntry`,
  `purgeTrashEntry` and `emptyTrash`. `SpacesService` gains `deleteSpace` and `ListsService`
  `deleteList`. Each comes with its `…ClientResult` type, and the new models, enumerations and error
  responses are exported (`Grant`, `AccessRole`, `AccessRoleValue`, `AccessRequest`, `TrashEntry`,
  `TrashRestored`, `ArchivedList`, `ArchivedTask`, `ListRef`, `TaskArchivedResponse` and the others).
  `Space`, `TaskList`, `Task`, `ListCreation` and `ListPatch` gain optional members.

## 0.8.0

### Minor Changes

- 14a6209: Add the calls of the task core. The new `SpacesService` has `createSpace`, `listSpaces`, `getSpace`,
  `updateSpace` and `getSpaceOverview`; `ListsService` has `createList`, `listLists`, `getList`,
  `updateList`, `getListCounts` and `listListActivity`; `TasksService` has `createTask`, `getTask`,
  `updateTask`, `assignTask`, `unassignTask`, `addTaskLabel`, `removeTaskLabel`, `getTaskDetail`,
  `listSubtasks`, `createSubtask`, `addChecklistItem`, `updateChecklistItem` and `listLabels`;
  `TaskQueriesService` has `listTasks` and `countTaskGroups`; `TaskActivityService` has
  `listTaskActivity`; `MyTasksService` has `listMyTasks` and `getHome`. Each comes with its
  `…ClientResult` type, and the new models, enumerations and error responses are exported (`Space`,
  `TaskList`, `Task`, `TaskSummary`, `TaskDetail`, `ActivityEntry`, `Home`, `StatusKey`,
  `PriorityKey`, `CancelReason`, `TaskChangeRefusedResponse` and the others).

## 0.7.0

### Minor Changes

- a199c87: Add the calls of two-step verification. The new `TwoStepVerificationService` has
  `getTwoStepVerification`, `disableTwoStepVerification`, `startAuthenticatorAppSetup`,
  `confirmAuthenticatorAppSetup`, `regenerateBackupCodes`, `startSecurityKeyRegistration`,
  `addSecurityKey` and `removeSecurityKey`; `AuthService` gains `inspectSignInChallenge`,
  `answerSignInChallengeWithAuthenticatorApp`, `answerSignInChallengeWithBackupCode`,
  `getSignInChallengeSecurityKeyOptions` and `answerSignInChallengeWithSecurityKey`; the new
  `AuthenticationPolicyService` has `getAuthenticationPolicy` and `updateAuthenticationPolicy`. Each
  comes with its `…ClientResult` type, and the new models and error responses are exported
  (`SignInChallenge`, `TwoStepVerification`, `SecurityKey`, `BackupCodes`, `AuthenticationPolicy`,
  `TwoStepLockedResponse`, `OrganizationChoiceForbiddenResponse` and the others).
  
  `SignInWithPasswordClientResult` and `SignInWithCodeClientResult` widen to
  `SignedInResponse | ChallengeIssuedResponse`: a sign-in of an account with two-step verification
  answers `202` with a challenge, and only a `200` means signed in. `ReauthenticationRequest` takes
  `password` or `code`, both optional. `OpenSession` gains an optional `inactivityTimeoutMinutes` and
  `Member` an optional `twoStepVerificationEnabled`.

## 0.6.0

### Minor Changes

- 64f34f9: Add the account security screens' calls. `AuthService` gains `requestPasswordReset`,
  `inspectPasswordResetLink`, `confirmPasswordReset` and `reauthenticate`; the new `AccountService`
  has `changePassword`, `requestEmailChange`, `confirmEmailChange` and `scheduleAccountDeletion`; the
  new `SessionsService` has `listSessions`, `revokeSession` and `revokeOtherSessions`. Each comes with
  its `…ClientResult` type, and the new models and error responses are exported (`Device`,
  `OpenSession`, `OpenSessionPage`, `RecentAuthentication`, `PasswordResetLink`,
  `RecentAuthenticationForbiddenResponse`, `OrganizationOwnerResponse` and the others). `CurrentUser`
  gains an optional `passwordChangedAt` and `SignedIn` an optional `deletionCancelled`. `EmptyRequest`,
  `SessionWriteForbiddenResponse` and `NextCursor` are now exported from the authentication document,
  the first that generates them, with the same shape.
  
  `ApiTokensService.createApiToken` documents `403 auth.reauthentication-required`, with the new
  `TokenCreationForbiddenResponse`. `InvitationBatchLimitedResponse` and
  `InvitationResendLimitedResponse`, generated since 0.5.0 but missing from the package entry, are
  now exported.

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

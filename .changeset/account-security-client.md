---
'@cadenway/api-client': minor
---

Add the account security screens' calls. `AuthService` gains `requestPasswordReset`,
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

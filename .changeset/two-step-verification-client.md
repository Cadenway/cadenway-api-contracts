---
'@cadenway/api-client': minor
---

Add the calls of two-step verification. The new `TwoStepVerificationService` has
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

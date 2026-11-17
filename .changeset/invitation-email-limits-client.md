---
'@cadenway/api-client': minor
---

`InvitationsService.inviteMembers` and `InvitationsService.resendInvitation` document their new
`429` codes, `invitation.daily-limit-reached` (`details.remaining`, `details.nextAvailableAt`) and,
for the resend, `invitation.resend-throttled` (`details.resendAvailableAt`), each with
`Retry-After`, beside `rate-limit.exceeded`. New exported types `InvitationBatchLimitedResponse` and
`InvitationResendLimitedResponse`. Descriptions only elsewhere: the organization `website` accepts
only `http` and `https` URLs, choosing the current organization again records it as the last choice,
and removing a member states what happens to their tokens and sessions if they join again.

---
'@cadenway/contracts': minor
---

Limit the invitation emails. `POST /v1/invitations/{invitationId}/resend` and
`POST /internal/v1/invitations/{invitationId}/resend` answer `429 invitation.resend-throttled`, with
`Retry-After` and `details.resendAvailableAt`, less than an hour after the last sending of the
invitation (`sentAt`). An organization causes at most 100 invitation emails in any 24 hours, issues
and resends together: `POST /v1/invitations` and `POST /internal/v1/invitations` refuse a batch that
needs more than what remains as a whole with `429 invitation.daily-limit-reached`, with
`Retry-After` and `details.remaining`, and a resend with none left answers the same code. The
public `429` responses keep `rate-limit.exceeded`. New types `InvitationBatchLimitedResponse` and
`InvitationResendLimitedResponse` in `types/public/members` and `types/internal/organization-service`.

The generated query validators now read a numeric query parameter from its text: `limit: '8'`
passes as `8`, `limit: 'abc'` still fails, and a string parameter keeps its text. A consumer can
drop its own conversion of `limit` before the validator.

Descriptions only: the organization `website` accepts only `http` and `https` URLs; the
`organizationId` of `session.revoked.v1` is always `null` in this version; `member.removed.v1`, the
API token introspection and the `organizationId` of an active session state what a removal then a
new membership does; choosing the current organization again records it as the last choice; the
cross-site rule of every public document matches the gateway (`POST`, `PUT` and `PATCH` need
`Content-Type: application/json`, a bodiless `DELETE` passes on its `Origin`).

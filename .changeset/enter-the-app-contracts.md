---
'@cadenway/contracts': minor
---

Add the contracts that let a signed-up person enter the application. New
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
fills `organizationId`, `role` and `scopes`, and `user.profile-updated.v1`. The new response members
are required: identity-service fills them before the API gateway moves to this version.

Every public operation now declares its own `security`: the session cookie, and `apiToken` with the
scope a personal API token needs (`members:read` on the member reads); the routes of `auth.yaml` stay
session only and gain `403 auth.api-token-not-accepted` and `401 auth.api-token-invalid`.

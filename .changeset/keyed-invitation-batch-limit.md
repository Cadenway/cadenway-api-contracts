---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Add `429 invitation.keyed-batch-limit-reached` to keyed invitation batches (`inviteMembers`, `inviteMembersInternal` and `inviteMembersKeyedInternal`), with `Retry-After` and `details.nextAvailableAt`, so organization-service can bound the live replay records of each organization.

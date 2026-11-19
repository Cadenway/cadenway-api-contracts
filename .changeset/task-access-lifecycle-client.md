---
'@cadenway/api-client': minor
---

Add the calls of sharing, access requests, archives, the trash and deletions. The new
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

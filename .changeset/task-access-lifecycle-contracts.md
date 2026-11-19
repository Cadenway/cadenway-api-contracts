---
'@cadenway/contracts': minor
---

Add the contracts of sharing, access requests, archives, the trash and deletions of the task core.

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

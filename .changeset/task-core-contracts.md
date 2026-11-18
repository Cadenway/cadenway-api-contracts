---
'@cadenway/contracts': minor
---

Add the contracts of the task core: spaces, lists and sprints, tasks, subtasks, assignees, labels,
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

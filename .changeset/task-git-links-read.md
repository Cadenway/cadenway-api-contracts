---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Add the read of a task's Git links: `GET /v1/tasks/{taskKey}/git-links` (`GitLinksService`),
its integration-service counterpart `GET /internal/v1/tasks/{taskKey}/git-links`, the shared
`GitLink` and `GitLinkPage` schemas, and the optional `development` part of `TaskDetail`.

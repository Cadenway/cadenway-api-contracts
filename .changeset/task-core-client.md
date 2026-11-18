---
'@cadenway/api-client': minor
---

Add the calls of the task core. The new `SpacesService` has `createSpace`, `listSpaces`, `getSpace`,
`updateSpace` and `getSpaceOverview`; `ListsService` has `createList`, `listLists`, `getList`,
`updateList`, `getListCounts` and `listListActivity`; `TasksService` has `createTask`, `getTask`,
`updateTask`, `assignTask`, `unassignTask`, `addTaskLabel`, `removeTaskLabel`, `getTaskDetail`,
`listSubtasks`, `createSubtask`, `addChecklistItem`, `updateChecklistItem` and `listLabels`;
`TaskQueriesService` has `listTasks` and `countTaskGroups`; `TaskActivityService` has
`listTaskActivity`; `MyTasksService` has `listMyTasks` and `getHome`. Each comes with its
`…ClientResult` type, and the new models, enumerations and error responses are exported (`Space`,
`TaskList`, `Task`, `TaskSummary`, `TaskDetail`, `ActivityEntry`, `Home`, `StatusKey`,
`PriorityKey`, `CancelReason`, `TaskChangeRefusedResponse` and the others).

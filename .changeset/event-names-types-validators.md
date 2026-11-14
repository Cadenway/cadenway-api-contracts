---
'@cadenway/contracts': minor
---

Generate `@cadenway/contracts/events/<spec>` from the AsyncAPI documents: for each event its name
(`TASK_UPDATED_V1`), the type of its payload (`TaskUpdatedV1`) and the zod validator of that payload
(`taskUpdatedV1Schema`), then `EVENT_NAMES`, `EventName`, `EventPayloads` and `eventSchemas` to reach
the three by event name. A validator drops the members it does not know, so an event that gains an
optional member is still read by a consumer built on the previous version.

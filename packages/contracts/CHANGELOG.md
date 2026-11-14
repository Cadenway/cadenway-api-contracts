# @cadenway/contracts

## 0.2.0

### Minor Changes

- 9250b31: Give `@cadenway/contracts/types/<spec>` a producer: every OpenAPI document now yields one module of
  TypeScript types, one per schema and per parameter set (`Task`, `Problem`, `ListTasksParams`). The
  validators stay per operation, with the schemas inlined and without the error responses, so they do
  not replace these types.
- 9250b31: Generate `@cadenway/contracts/events/<spec>` from the AsyncAPI documents: for each event its name
  (`TASK_UPDATED_V1`), the type of its payload (`TaskUpdatedV1`) and the zod validator of that payload
  (`taskUpdatedV1Schema`), then `EVENT_NAMES`, `EventName`, `EventPayloads` and `eventSchemas` to reach
  the three by event name. A validator drops the members it does not know, so an event that gains an
  optional member is still read by a consumer built on the previous version.
- 9250b31: Export the shared enumerations from the package root, as a list of values and its type:
  `STATUS_KEYS` / `StatusKey`, `STATUS_CATEGORIES` / `StatusCategory` with `STATUS_CATEGORY_BY_KEY`,
  `MILESTONE_STATUS_KEYS` / `MilestoneStatusKey`, `PRIORITY_KEYS` / `PriorityKey`, `CANCEL_REASONS` /
  `CancelReason` and `RECURRENCES` / `Recurrence`. The values are the keys of the mockup data model.
- 9250b31: Ship the specs in the package, under `@cadenway/contracts/specs/<kind>/<spec>.yaml` (`<kind>` is
  `openapi` or `asyncapi`). Each file is self-contained: what the spec takes from the shared
  components is copied into it, so a service can generate its own client for another service from the
  published contract with the default options of its generator.

### Patch Changes

- 9250b31: Define the problem, the pagination members and the event actor once, in `components/`, for every spec
  to reference. Types, validators and shipped specs carry them as if they were written in each spec;
  no import path changes.

## 0.1.0

### Minor Changes

- bcc464d: Bootstrap both packages as empty shells. `@cadenway/contracts` declares its entry point and the
  `types/`, `validators/` and `events/` subpaths the generators fill; `@cadenway/api-client` is an
  empty Angular library. No route, event or enumeration is published yet.

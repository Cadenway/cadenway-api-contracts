/**
 * Entry point of `@cadenway/contracts`: the shared enumerations authored in `./enums/`.
 *
 * The generated modules are not re-exported here: each one is imported through its own subpath, so
 * two specs may use the same schema name.
 *
 * - `@cadenway/contracts/types/<spec>`: TypeScript types of the schemas of an OpenAPI document;
 * - `@cadenway/contracts/validators/<spec>`: zod validators of its operations;
 * - `@cadenway/contracts/events/<spec>`: event names, payload types and zod validators of an
 *   AsyncAPI document;
 * - `@cadenway/contracts/specs/<kind>/<spec>.yaml`: the spec itself, as one self-contained file.
 *
 * `<spec>` is the path of the document below `openapi/` or `asyncapi/`, without extension; `<kind>`
 * is `openapi` or `asyncapi`.
 */
export { CANCEL_REASONS, type CancelReason } from './enums/cancel-reason.js';
export { MILESTONE_STATUS_KEYS, type MilestoneStatusKey } from './enums/milestone-status.js';
export { PRIORITY_KEYS, type PriorityKey } from './enums/priority.js';
export { RECURRENCES, type Recurrence } from './enums/recurrence.js';
export {
  STATUS_CATEGORIES,
  STATUS_CATEGORY_BY_KEY,
  STATUS_KEYS,
  type StatusCategory,
  type StatusKey,
} from './enums/status.js';

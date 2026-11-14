/**
 * Constant STATUS_KEYS
 *
 * @description
 * Keys of the ten task statuses, in the order of the workflow. A space renames a status, it never
 * adds or removes a key. Source: the `STATUSES` table of the mockup data model.
 *
 * @type {readonly ['triage', 'backlog', 'todo', 'progress', 'review', 'testing', 'waiting', 'blocked', 'done', 'cancelled']}
 */
export const STATUS_KEYS: readonly [
  'triage',
  'backlog',
  'todo',
  'progress',
  'review',
  'testing',
  'waiting',
  'blocked',
  'done',
  'cancelled',
] = [
  'triage',
  'backlog',
  'todo',
  'progress',
  'review',
  'testing',
  'waiting',
  'blocked',
  'done',
  'cancelled',
];

/**
 * Type StatusKey
 *
 * @description
 * Key of a task status.
 *
 * @type {'triage' | 'backlog' | 'todo' | 'progress' | 'review' | 'testing' | 'waiting' | 'blocked' | 'done' | 'cancelled'}
 */
export type StatusKey = (typeof STATUS_KEYS)[number];

/**
 * Constant STATUS_CATEGORIES
 *
 * @description
 * Categories of status, from not started to closed. Counters, due dates and dashboards read the
 * category of a task, never its status key. Source: the `STATUS_CATS` table of the mockup data
 * model.
 *
 * @type {readonly ['open', 'active', 'closed']}
 */
export const STATUS_CATEGORIES: readonly ['open', 'active', 'closed'] = [
  'open',
  'active',
  'closed',
];

/**
 * Type StatusCategory
 *
 * @description
 * Category of a task status.
 *
 * @type {'open' | 'active' | 'closed'}
 */
export type StatusCategory = (typeof STATUS_CATEGORIES)[number];

/**
 * Constant STATUS_CATEGORY_BY_KEY
 *
 * @description
 * Category of each status key. Source: the `cat` member of the `STATUSES` table of the mockup data
 * model.
 *
 * @type {Readonly<Record<StatusKey, StatusCategory>>}
 */
export const STATUS_CATEGORY_BY_KEY: Readonly<Record<StatusKey, StatusCategory>> = {
  triage: 'open',
  backlog: 'open',
  todo: 'open',
  progress: 'active',
  review: 'active',
  testing: 'active',
  waiting: 'active',
  blocked: 'active',
  done: 'closed',
  cancelled: 'closed',
};

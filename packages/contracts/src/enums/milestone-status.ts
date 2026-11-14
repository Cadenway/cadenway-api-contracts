/**
 * Constant MILESTONE_STATUS_KEYS
 *
 * @description
 * Status keys a milestone can take: upcoming, at risk, reached, cancelled. A milestone has no work
 * in progress, only a date that is kept or not, so it uses four of the task status keys. Source:
 * the `MS_STATUS` table of the mockup data model.
 *
 * @type {readonly ['todo', 'blocked', 'done', 'cancelled']}
 */
export const MILESTONE_STATUS_KEYS: readonly ['todo', 'blocked', 'done', 'cancelled'] = [
  'todo',
  'blocked',
  'done',
  'cancelled',
];

/**
 * Type MilestoneStatusKey
 *
 * @description
 * Status key of a milestone; every value is also a `StatusKey`.
 *
 * @type {'todo' | 'blocked' | 'done' | 'cancelled'}
 */
export type MilestoneStatusKey = (typeof MILESTONE_STATUS_KEYS)[number];

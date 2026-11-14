/**
 * Constant RECURRENCES
 *
 * @description
 * How a task repeats: never, every working day, every week, every two weeks, every month. The next
 * occurrence is created when the task is closed. Source: the `RECURS` table of the mockup data
 * model.
 *
 * @type {readonly ['none', 'daily', 'weekly', 'biweekly', 'monthly']}
 */
export const RECURRENCES: readonly ['none', 'daily', 'weekly', 'biweekly', 'monthly'] = [
  'none',
  'daily',
  'weekly',
  'biweekly',
  'monthly',
];

/**
 * Type Recurrence
 *
 * @description
 * Recurrence of a task.
 *
 * @type {'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'}
 */
export type Recurrence = (typeof RECURRENCES)[number];

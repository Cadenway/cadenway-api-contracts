/**
 * Constant PRIORITY_KEYS
 *
 * @description
 * Keys of the task priorities, from the most to the least urgent. A task created without a
 * priority gets `moyenne`. Source: the `PRIORITIES` table of the mockup data model.
 *
 * @type {readonly ['urgente', 'haute', 'moyenne', 'basse']}
 */
export const PRIORITY_KEYS: readonly ['urgente', 'haute', 'moyenne', 'basse'] = [
  'urgente',
  'haute',
  'moyenne',
  'basse',
];

/**
 * Type PriorityKey
 *
 * @description
 * Key of a task priority.
 *
 * @type {'urgente' | 'haute' | 'moyenne' | 'basse'}
 */
export type PriorityKey = (typeof PRIORITY_KEYS)[number];

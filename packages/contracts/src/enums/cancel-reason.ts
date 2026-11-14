/**
 * Constant CANCEL_REASONS
 *
 * @description
 * Reasons given when a task is cancelled: duplicate, will not be done, out of scope, obsolete.
 * Source: the `CANCEL_REASONS` table of the mockup data model.
 *
 * @type {readonly ['duplicate', 'wontdo', 'scope', 'obsolete']}
 */
export const CANCEL_REASONS: readonly ['duplicate', 'wontdo', 'scope', 'obsolete'] = [
  'duplicate',
  'wontdo',
  'scope',
  'obsolete',
];

/**
 * Type CancelReason
 *
 * @description
 * Reason a task was cancelled for.
 *
 * @type {'duplicate' | 'wontdo' | 'scope' | 'obsolete'}
 */
export type CancelReason = (typeof CANCEL_REASONS)[number];

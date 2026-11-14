import { describe, expect, it } from 'vitest';

import {
  CANCEL_REASONS,
  MILESTONE_STATUS_KEYS,
  PRIORITY_KEYS,
  RECURRENCES,
  STATUS_CATEGORIES,
  STATUS_CATEGORY_BY_KEY,
  STATUS_KEYS,
  type StatusCategory,
  type StatusKey,
} from '../../packages/contracts/src/index.js';

// The values are the keys of the mockup data model. Changing one of these expectations is a
// contract change: adding a value is minor, removing or renaming one is major.
describe('shared enumerations', () => {
  it('lists the ten status keys in workflow order', () => {
    expect(STATUS_KEYS).toEqual([
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
    ]);
  });

  it('gives every status key one of the three categories', () => {
    expect(STATUS_CATEGORIES).toEqual(['open', 'active', 'closed']);
    expect(Object.keys(STATUS_CATEGORY_BY_KEY)).toEqual([...STATUS_KEYS]);

    const byCategory: Record<StatusCategory, StatusKey[]> = { open: [], active: [], closed: [] };
    for (const key of STATUS_KEYS) {
      byCategory[STATUS_CATEGORY_BY_KEY[key]].push(key);
    }
    expect(byCategory).toEqual({
      open: ['triage', 'backlog', 'todo'],
      active: ['progress', 'review', 'testing', 'waiting', 'blocked'],
      closed: ['done', 'cancelled'],
    });
  });

  it('keeps the milestone statuses among the task statuses', () => {
    const statusKeys: readonly string[] = STATUS_KEYS;

    expect(MILESTONE_STATUS_KEYS).toEqual(['todo', 'blocked', 'done', 'cancelled']);
    expect(MILESTONE_STATUS_KEYS.filter((key) => !statusKeys.includes(key))).toEqual([]);
  });

  it('lists priorities, cancel reasons and recurrences', () => {
    expect(PRIORITY_KEYS).toEqual(['urgente', 'haute', 'moyenne', 'basse']);
    expect(CANCEL_REASONS).toEqual(['duplicate', 'wontdo', 'scope', 'obsolete']);
    expect(RECURRENCES).toEqual(['none', 'daily', 'weekly', 'biweekly', 'monthly']);
  });

  it('never repeats a value', () => {
    for (const values of [
      STATUS_KEYS,
      STATUS_CATEGORIES,
      MILESTONE_STATUS_KEYS,
      PRIORITY_KEYS,
      CANCEL_REASONS,
      RECURRENCES,
    ]) {
      expect(new Set<string>(values).size).toBe(values.length);
    }
  });
});

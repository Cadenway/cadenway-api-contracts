import { describe, expect, it } from 'vitest';

import {
  CreateAutomationRuleInternalBody,
  ListAutomationRunCandidatesInternalResponse,
  UpdateAutomationRuleInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/automation-service';
import {
  GetTaskVisibilityInternalBody,
  GetTaskVisibilityInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  CreateAutomationRuleBody,
  ListRecentAutomationRunsResponse,
  UpdateAutomationRuleBody,
} from '../../packages/contracts/src/generated/validators/public/automations';

describe('Task visibility proof', () => {
  it('accepts a bounded request without duplicates or an extra tenant selector', () => {
    const taskKeys: string[] = Array.from(
      { length: 101 },
      (_, index) => `CAD-${String(index + 1)}`,
    );
    const valid: { taskKeys: string[] } = { taskKeys: taskKeys.slice(0, 100) };
    expect(GetTaskVisibilityInternalBody.safeParse(valid).success).toBe(true);
    expect(GetTaskVisibilityInternalBody.safeParse({ taskKeys: [] }).success).toBe(false);
    expect(GetTaskVisibilityInternalBody.safeParse({ taskKeys }).success).toBe(false);
    expect(
      GetTaskVisibilityInternalBody.safeParse({ taskKeys: ['CAD-482', 'CAD-482'] }).success,
    ).toBe(false);
    expect(
      GetTaskVisibilityInternalBody.safeParse({ ...valid, organizationId: 'other' }).success,
    ).toBe(false);
  });

  it('accepts an empty visible subset and rejects repeated keys and extra fields', () => {
    expect(GetTaskVisibilityInternalResponse.safeParse({ visibleTaskKeys: [] }).success).toBe(true);
    expect(
      GetTaskVisibilityInternalResponse.safeParse({ visibleTaskKeys: ['CAD-482'] }).success,
    ).toBe(true);
    expect(
      GetTaskVisibilityInternalResponse.safeParse({ visibleTaskKeys: ['CAD-482', 'CAD-482'] })
        .success,
    ).toBe(false);
    expect(
      GetTaskVisibilityInternalResponse.safeParse({ visibleTaskKeys: [], hiddenTaskKeys: [] })
        .success,
    ).toBe(false);
  });
});

describe('Automation rules', () => {
  it.each([CreateAutomationRuleBody, CreateAutomationRuleInternalBody])(
    'accepts the supported trigger and action shapes only',
    (create) => {
      const userId: string = '019a5f3c-a0b1-7c2d-9e3f-5a6b7c8d9e32';
      const base: { trigger: { type: string } } = { trigger: { type: 'created' } };

      expect(create.safeParse({ ...base, action: { type: 'assign', userId } }).success).toBe(true);
      expect(create.safeParse({ ...base, action: { type: 'notify', userId } }).success).toBe(true);
      expect(
        create.safeParse({ ...base, action: { type: 'comment', body: 'À relire' } }).success,
      ).toBe(true);
      expect(
        create.safeParse({
          ...base,
          trigger: { type: 'status', status: 'blocked' },
          action: { type: 'priority', priority: 'urgente' },
        }).success,
      ).toBe(true);

      expect(create.safeParse({ ...base, action: { type: 'notify' } }).success).toBe(false);
      expect(create.safeParse({ ...base, action: { type: 'comment', body: '  ' } }).success).toBe(
        false,
      );
      expect(
        create.safeParse({ ...base, action: { type: 'assign', userId, priority: 'urgente' } })
          .success,
      ).toBe(false);
      expect(
        create.safeParse({
          ...base,
          trigger: { type: 'status' },
          action: { type: 'notify', userId },
        }).success,
      ).toBe(false);
      expect(
        create.safeParse({ ...base, organizationId: userId, action: { type: 'notify', userId } })
          .success,
      ).toBe(false);
    },
  );

  it.each([UpdateAutomationRuleBody, UpdateAutomationRuleInternalBody])(
    'accepts only an enabled value in a patch',
    (update) => {
      expect(update.safeParse({ enabled: false }).success).toBe(true);
      expect(update.safeParse({}).success).toBe(false);
      expect(update.safeParse({ enabled: false, name: 'Rename' }).success).toBe(false);
    },
  );
});

describe('Recent automation executions', () => {
  it('bounds public history to eight and excludes the cursor and comment content', () => {
    const run: {
      executionId: string;
      ruleId: string;
      taskKey: string;
      action: { type: string };
      executedAt: string;
    } = {
      executionId: '019a701b-2b3c-7d4e-8f5a-6b7c8d9e0f12',
      ruleId: '019a700b-1a2b-7c3d-8e4f-5a6b7c8d9e01',
      taskKey: 'CAD-482',
      action: { type: 'comment' },
      executedAt: '2026-11-20T08:05:00Z',
    };

    expect(ListRecentAutomationRunsResponse.safeParse({ items: [] }).success).toBe(true);
    expect(ListRecentAutomationRunsResponse.safeParse({ items: Array(8).fill(run) }).success).toBe(
      true,
    );
    expect(ListRecentAutomationRunsResponse.safeParse({ items: Array(9).fill(run) }).success).toBe(
      false,
    );
    expect(
      ListRecentAutomationRunsResponse.safeParse({ items: [run], nextCursor: 'opaque' }).success,
    ).toBe(false);
    expect(
      ListRecentAutomationRunsResponse.safeParse({
        items: [{ ...run, action: { type: 'comment', body: 'À relire' } }],
      }).success,
    ).toBe(false);
    expect(
      ListAutomationRunCandidatesInternalResponse.safeParse({
        items: Array(100).fill(run),
        nextCursor: 'opaque',
      }).success,
    ).toBe(true);
    expect(
      ListAutomationRunCandidatesInternalResponse.safeParse({
        items: Array(101).fill(run),
        nextCursor: null,
      }).success,
    ).toBe(false);
  });
});

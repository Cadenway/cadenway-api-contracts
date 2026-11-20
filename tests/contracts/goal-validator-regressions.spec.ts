import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';

import {
  CreateGoalBody,
  CreateGoalResultBody,
  UpdateGoalBody,
  UpdateGoalResultBody,
} from '../../packages/contracts/src/generated/validators/public/goals';
import { GetTeamDashboardQueryParams } from '../../packages/contracts/src/generated/validators/public/reports';
import {
  CreateGoalInternalBody,
  CreateGoalResultInternalBody,
  GetTeamDashboardInternalQueryParams,
  UpdateGoalInternalBody,
  UpdateGoalResultInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/task-service';

/**
 * Constant goal
 *
 * @description
 * A valid goal creation request.
 *
 * @type {{ name: string; ownerUserId: string; dueDate: string; quarter: string }}
 */
const goal: { name: string; ownerUserId: string; dueDate: string; quarter: string } = {
  name: 'Launch',
  ownerUserId: '019a700a-1234-7567-89ab-cdef01234567',
  dueDate: '2026-12-31',
  quarter: '2026-Q4',
};
/**
 * Constant result
 *
 * @description
 * A valid checkbox result.
 *
 * @type {{ kind: string; label: string; checked: boolean }}
 */
const result: { kind: string; label: string; checked: boolean } = {
  kind: 'checkbox',
  label: 'Done',
  checked: false,
};

describe.each([
  {
    name: 'public',
    create: CreateGoalBody,
    update: UpdateGoalBody,
    createResult: CreateGoalResultBody,
    updateResult: UpdateGoalResultBody,
    dashboard: GetTeamDashboardQueryParams,
  },
  {
    name: 'internal',
    create: CreateGoalInternalBody,
    update: UpdateGoalInternalBody,
    createResult: CreateGoalResultInternalBody,
    updateResult: UpdateGoalResultInternalBody,
    dashboard: GetTeamDashboardInternalQueryParams,
  },
])(
  '$name goal validators',
  (validators: {
    name: string;
    create: ZodType;
    update: ZodType;
    createResult: ZodType;
    updateResult: ZodType;
    dashboard: ZodType<{ weeks: number }>;
  }) => {
    it('keeps request objects and nested result variants closed', () => {
      expect(validators.create.safeParse({ ...goal, results: [result] }).success).toBe(true);
      expect(validators.create.safeParse({ ...goal, unexpected: true }).success).toBe(false);
      expect(
        validators.create.safeParse({ ...goal, results: [{ ...result, unexpected: true }] })
          .success,
      ).toBe(false);
      expect(validators.update.safeParse({ name: 'Updated' }).success).toBe(true);
      expect(validators.update.safeParse({ name: 'Updated', unexpected: true }).success).toBe(
        false,
      );
      expect(validators.createResult.safeParse(result).success).toBe(true);
      expect(validators.createResult.safeParse({ ...result, unexpected: true }).success).toBe(
        false,
      );
      expect(validators.updateResult.safeParse({ checked: true }).success).toBe(true);
      expect(validators.updateResult.safeParse({ checked: true, unexpected: true }).success).toBe(
        false,
      );
    });

    it('accepts only the supported HTTP week counts and defaults to eight', () => {
      const query: { today: string; timeZone: string } = {
        today: '2026-11-20',
        timeZone: 'Europe/Paris',
      };
      expect(validators.dashboard.parse(query).weeks).toBe(8);
      expect(validators.dashboard.parse({ ...query, weeks: '8' }).weeks).toBe(8);
      expect(validators.dashboard.parse({ ...query, weeks: '12' }).weeks).toBe(12);
      expect(validators.dashboard.parse({ ...query, weeks: 12 }).weeks).toBe(12);
      for (const weeks of ['9', '08', '', ' 8', 9, null]) {
        expect(validators.dashboard.safeParse({ ...query, weeks }).success).toBe(false);
      }
    });
  },
);

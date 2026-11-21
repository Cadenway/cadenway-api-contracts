import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { CreateAutomationRuleInternalBody } from '../../packages/contracts/src/generated/validators/internal/automation-service';
import { CreateAutomationRuleBody } from '../../packages/contracts/src/generated/validators/public/automations';

describe('automation comment length', () => {
  it.each([CreateAutomationRuleBody, CreateAutomationRuleInternalBody])(
    'accepts 5000 supplementary code points and refuses excess or whitespace',
    (schema) => {
      const input: z.input<typeof CreateAutomationRuleBody> = {
        trigger: { type: 'created' },
        action: { type: 'comment', body: '🙂'.repeat(5000) },
      };
      expect(schema.parse(input)).toEqual(input);
      expect(
        schema.safeParse({ ...input, action: { ...input.action, body: '🙂'.repeat(5001) } })
          .success,
      ).toBe(false);
      expect(
        schema.safeParse({ ...input, action: { ...input.action, body: ' \n ' } }).success,
      ).toBe(false);
    },
  );
});

import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';

import {
  CompleteReminderInternalResponse,
  GetReminderInternalResponse,
  GetTaskReminderInternalResponse,
  ListVisibleReminderRecordsInternalResponse,
  SetTaskReminderInternalBody,
  SetTaskReminderInternalResponse,
  SnoozeReminderInternalResponse,
  UpdateReminderNoteInternalBody,
  UpdateReminderNoteInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/notification-service';
import {
  CompleteReminderResponse,
  GetReminderResponse,
  GetTaskReminderResponse,
  ListRemindersResponse,
  SetTaskReminderBody,
  SetTaskReminderResponse,
  SnoozeReminderResponse,
  UpdateReminderNoteBody,
  UpdateReminderNoteResponse,
} from '../../packages/contracts/src/generated/validators/public/reminders';

interface ReminderValidators {
  readonly side: string;
  readonly create: ZodType;
  readonly update: ZodType;
  readonly page: ZodType;
  readonly responses: readonly ZodType[];
  readonly task: Readonly<Record<string, string>>;
  readonly pageMetadata: Readonly<Record<string, unknown>>;
}

const cases: readonly ReminderValidators[] = [
  {
    side: 'public',
    create: SetTaskReminderBody,
    update: UpdateReminderNoteBody,
    page: ListRemindersResponse,
    task: { taskKey: 'CAD-482', taskName: 'Refonte du compte' },
    pageMetadata: { nextCursor: null, pendingCount: 1 },
    responses: [
      GetTaskReminderResponse,
      SetTaskReminderResponse,
      GetReminderResponse,
      UpdateReminderNoteResponse,
      SnoozeReminderResponse,
      CompleteReminderResponse,
    ],
  },
  {
    side: 'internal',
    create: SetTaskReminderInternalBody,
    update: UpdateReminderNoteInternalBody,
    page: ListVisibleReminderRecordsInternalResponse,
    task: { taskId: '019a7002-3c4d-7e5f-8a6b-7c8d9e0f1a23' },
    pageMetadata: {},
    responses: [
      GetTaskReminderInternalResponse,
      SetTaskReminderInternalResponse,
      GetReminderInternalResponse,
      UpdateReminderNoteInternalResponse,
      SnoozeReminderInternalResponse,
      CompleteReminderInternalResponse,
    ],
  },
];

describe.each(cases)(
  '$side reminder note length',
  ({ create, update, page, responses, task, pageMetadata }: ReminderValidators) => {
    it('counts Unicode code points in writes and every reminder response', () => {
      const note: string = '🚀'.repeat(500);
      const remindAt: string = '2026-11-20T15:00:00Z';
      const reminder: Readonly<Record<string, unknown>> = {
        id: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31',
        ...task,
        remindAt,
        note,
        firedAt: null,
        completedAt: null,
        version: 1,
      };

      expect(create.safeParse({ remindAt, note }).success).toBe(true);
      expect(create.safeParse({ remindAt, note: note + 'a' }).success).toBe(false);
      expect(update.safeParse({ note }).success).toBe(true);
      expect(update.safeParse({ note: note + 'a' }).success).toBe(false);
      for (const schema of responses) {
        expect(schema.safeParse(reminder).success).toBe(true);
        expect(schema.safeParse({ ...reminder, note: note + 'a' }).success).toBe(false);
      }
      expect(page.safeParse({ items: [reminder], ...pageMetadata }).success).toBe(true);
      expect(
        page.safeParse({
          items: [{ ...reminder, note: note + 'a' }],
          ...pageMetadata,
        }).success,
      ).toBe(false);
    });
  },
);

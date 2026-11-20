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

/**
 * Interface ReminderValidators
 *
 * @description
 * Generated reminder validators and fixtures for one side of the HTTP boundary.
 */
interface ReminderValidators {
  // #region Properties
  /**
   * Property side
   *
   * @description
   * Name of the contract boundary.
   *
   * @type {string}
   * @readonly
   */
  readonly side: string;

  /**
   * Property create
   *
   * @description
   * Creation request validator.
   *
   * @type {ZodType}
   * @readonly
   */
  readonly create: ZodType;

  /**
   * Property update
   *
   * @description
   * Note update request validator.
   *
   * @type {ZodType}
   * @readonly
   */
  readonly update: ZodType;

  /**
   * Property page
   *
   * @description
   * Reminder collection response validator.
   *
   * @type {ZodType}
   * @readonly
   */
  readonly page: ZodType;

  /**
   * Property responses
   *
   * @description
   * Individual reminder response validators.
   *
   * @type {readonly ZodType[]}
   * @readonly
   */
  readonly responses: readonly ZodType[];

  /**
   * Property task
   *
   * @description
   * Task fields presented on this side of the boundary.
   *
   * @type {Readonly<Record<string, string>>}
   * @readonly
   */
  readonly task: Readonly<Record<string, string>>;

  /**
   * Property pageMetadata
   *
   * @description
   * Collection metadata for a response with one reminder.
   *
   * @type {Readonly<Record<string, unknown>>}
   * @readonly
   */
  readonly pageMetadata: Readonly<Record<string, unknown>>;
  // #endregion
}

/**
 * Constant cases
 *
 * @description
 * Public and internal validators for the same reminder note boundaries.
 *
 * @type {readonly ReminderValidators[]}
 */
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

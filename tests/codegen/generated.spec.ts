import { describe, expect, it } from 'vitest';

import {
  userSignedUpV1Schema,
  type UserSignedUpV1,
} from './generated/contracts/events/identity-service';
import {
  EVENT_NAMES,
  TASK_UPDATED_V1,
  eventSchemas,
  taskUpdatedV1Schema,
  type EventPayloads,
  type TaskUpdatedV1,
} from './generated/contracts/events/task-service';
import type { Problem, Task, TaskPage } from './generated/contracts/types/public/tasks';
import {
  GetTaskInternalParams,
  GetTaskInternalResponse,
} from './generated/contracts/validators/internal/task-service';
import {
  ListTasksQueryParams,
  ListTasksResponse,
  UpdateTaskBody,
} from './generated/contracts/validators/public/tasks';

// tests/codegen/generated/ is what `pnpm generate` writes for the documents of tests/redocly/valid/,
// with the generators and the options used for the contracts. Importing it here proves that a route
// and an event give types and validators a consumer can use; its compilation with the options of
// the packages is part of `pnpm typecheck`.

/**
 * Constant ORGANIZATION_ID
 *
 * @description
 * UUID v7 standing for the organization of the mockup data.
 *
 * @type {string}
 */
const ORGANIZATION_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b2f';

/**
 * Constant USER_ID
 *
 * @description
 * UUID v7 standing for the signed-in user of the mockup data.
 *
 * @type {string}
 */
const USER_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

/**
 * Constant taskUpdated
 *
 * @description
 * Payload accepted by the validator of `task.updated.v1`, typed by the generated payload type.
 *
 * @type {TaskUpdatedV1}
 */
const taskUpdated: TaskUpdatedV1 = {
  id: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b31',
  occurredAt: '2026-11-08T09:05:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: USER_ID },
  version: 7,
  taskId: 'CAD-482',
  changed: ['status'],
};

/**
 * Constant userSignedUp
 *
 * @description
 * Payload accepted by the validator of `user.signed-up.v1`, with only its required members.
 *
 * @type {UserSignedUpV1}
 */
const userSignedUp: UserSignedUpV1 = {
  id: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b32',
  occurredAt: '2026-11-08T09:05:00Z',
  organizationId: null,
  actor: { type: 'system', id: 'identity-service' },
  version: 1,
  userId: USER_ID,
  email: 'camille.martin@ateliernord.example',
  method: 'password',
  signedUpOn: '2026-11-08',
};

/**
 * Constant task
 *
 * @description
 * Task of the mockup data, typed by the generated schema type.
 *
 * @type {Task}
 */
const task: Task = { id: 'CAD-482', title: 'Refondre l’écran de connexion SSO', version: 7 };

describe('code generated from a fixture event', () => {
  it('names the event and maps the name to its validator', () => {
    expect(TASK_UPDATED_V1).toBe('task.updated.v1');
    expect(EVENT_NAMES).toEqual(['task.updated.v1']);
    expect(eventSchemas[TASK_UPDATED_V1]).toBe(taskUpdatedV1Schema);
  });

  it('accepts a payload of the generated type', () => {
    const payload: EventPayloads['task.updated.v1'] = taskUpdated;

    expect(taskUpdatedV1Schema.parse(payload)).toEqual(taskUpdated);
  });

  it('refuses an actor type outside the four of the contract style', () => {
    expect(
      taskUpdatedV1Schema.safeParse({ ...taskUpdated, actor: { type: 'robot', id: USER_ID } })
        .success,
    ).toBe(false);
  });

  it('refuses a payload without the version of its aggregate', () => {
    const withoutVersion: Record<string, unknown> = { ...taskUpdated };
    delete withoutVersion['version'];

    expect(taskUpdatedV1Schema.safeParse(withoutVersion).success).toBe(false);
  });

  it('drops a member the contract does not declare yet', () => {
    expect(taskUpdatedV1Schema.parse({ ...taskUpdated, addedLater: true })).toEqual(taskUpdated);
  });

  it('accepts an event outside any organization and its optional members', () => {
    const complete: UserSignedUpV1 = {
      ...userSignedUp,
      invitationId: null,
      profile: { displayName: 'Camille Martin', timeZone: 'Europe/Paris' },
      interests: ['sprints'],
      attribution: { source: 'newsletter' },
    };

    expect(userSignedUpV1Schema.parse(userSignedUp)).toEqual(userSignedUp);
    expect(userSignedUpV1Schema.parse(complete)).toEqual(complete);
  });

  it('refuses an instant that is not in UTC and a bound that is not met', () => {
    expect(
      userSignedUpV1Schema.safeParse({ ...userSignedUp, occurredAt: '2026-11-08T10:05:00+01:00' })
        .success,
    ).toBe(false);
    expect(
      userSignedUpV1Schema.safeParse({ ...userSignedUp, profile: { displayName: '' } }).success,
    ).toBe(false);
  });
});

describe('code generated from a fixture route', () => {
  it('validates query parameters and applies the default page size', () => {
    expect(ListTasksQueryParams.parse({})).toEqual({ limit: 50 });
    expect(ListTasksQueryParams.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('validates a page typed by the generated schema types', () => {
    const page: TaskPage = { items: [task], nextCursor: null };

    expect(ListTasksResponse.parse(page)).toEqual(page);
  });

  it('validates a request body', () => {
    expect(UpdateTaskBody.parse({ title: task.title })).toEqual({ title: task.title });
    expect(UpdateTaskBody.safeParse({ title: 482 }).success).toBe(false);
  });

  it('validates the route of an internal document', () => {
    expect(GetTaskInternalParams.parse({ taskId: task.id })).toEqual({ taskId: task.id });
    expect(GetTaskInternalResponse.parse({ id: task.id, version: task.version })).toEqual({
      id: task.id,
      version: task.version,
    });
  });

  it('types the shared problem, which the validators do not carry', () => {
    const problem: Problem = {
      type: 'https://api.cadenway.com/problems/task-not-found',
      title: 'Task not found',
      status: 404,
      code: 'task.not-found',
    };

    expect(Object.keys(problem)).toEqual(['type', 'title', 'status', 'code']);
  });
});

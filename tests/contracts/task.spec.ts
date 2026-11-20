import { describe, expect, it } from 'vitest';

import { SavedViewSort } from '../../packages/contracts/src/generated/types/public/lists';

import { CancelReason as ClientCancelReason } from '../../packages/api-client/src/generated/public/spaces/model/cancelReason';
import { PriorityKey as ClientPriorityKey } from '../../packages/api-client/src/generated/public/spaces/model/priorityKey';
import { StatusKey as ClientStatusKey } from '../../packages/api-client/src/generated/public/spaces/model/statusKey';
import {
  EVENT_NAMES,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type TaskAssignedV1,
  type TaskStatusChangedV1,
} from '../../packages/contracts/src/generated/events/task-service';
import {
  CANCEL_REASONS,
  PRIORITY_KEYS,
  RECURRENCES,
  STATUS_CATEGORIES,
  STATUS_KEYS,
} from '../../packages/contracts/src/index';
import {
  CancelReason as InternalCancelReason,
  PriorityKey as InternalPriorityKey,
  StatusKey as InternalStatusKey,
} from '../../packages/contracts/src/generated/types/internal/task-service';
import {
  StatusCategory as ListsStatusCategory,
  StatusKey as ListsStatusKey,
} from '../../packages/contracts/src/generated/types/public/lists';
import {
  ListCreationColor,
  ListCreationIcon,
  LookColor,
  LookIcon,
  SpaceCreationColor,
  SpaceCreationIcon,
  SpaceCreationVisibility,
  StatusKey as SpacesStatusKey,
  Visibility,
} from '../../packages/contracts/src/generated/types/public/spaces';
import {
  CancelReason,
  Recurrence,
  TaskSortParameter,
  PriorityKey,
  StatusCategory,
  StatusKey,
  SubtaskCreationPriority,
  SubtaskCreationStatus,
  TaskCreationPriority,
  TaskCreationStatus,
} from '../../packages/contracts/src/generated/types/public/tasks';
import {
  CountTaskGroupsInternalQueryParams,
  ExecuteBulkTaskActionInternalBody,
  DuplicateTaskInternalBody,
  DuplicateListInternalBody,
  ListSpaceMilestonesInternalResponse,
  CreateTaskTemplateInternalBody,
  CreateSavedViewInternalBody,
  UpdateSavedViewInternalBody,
  DuplicateSavedViewInternalBody,
  CreateFavoriteInternalBody,
  CreateTaskCommentInternalBody,
  FollowTaskWatcherInternalBody,
  UpdateTaskCommentInternalBody,
  GetHomeInternalQueryParams,
  ListTasksInternalQueryParams,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  CreateSavedViewBody,
  GetSavedViewResponse,
  UpdateSavedViewBody,
  DuplicateSavedViewBody,
  CreateListBody,
  DuplicateListBody,
  ListListActivityResponse,
  ListListActivityQueryParams,
  UpdateListBody,
} from '../../packages/contracts/src/generated/validators/public/lists';
import {
  ListSpaceMilestonesResponse,
  CreateTaskTemplateBody,
  CreateFavoriteBody,
  GetFavoriteResponse,
  CreateSpaceBody,
  GetSpaceResponse,
  UpdateSpaceBody,
} from '../../packages/contracts/src/generated/validators/public/spaces';
import {
  AddTaskLabelBody,
  AssignTaskParams,
  CreateSubtaskBody,
  CountTaskGroupsQueryParams,
  ExecuteBulkTaskActionBody,
  DuplicateTaskBody,
  CreateTaskDependencyBody,
  ListTaskActivityQueryParams,
  CreateTaskBody,
  CreateTaskCommentBody,
  FollowTaskWatcherBody,
  ListTaskCommentsResponse,
  ListTaskParticipantsResponse,
  ListTaskWatchersResponse,
  UpdateTaskCommentBody,
  UpdateTaskCommentHeader,
  GetHomeQueryParams,
  GetTaskDetailResponse,
  GetTaskParams,
  ListTasksQueryParams,
  UpdateTaskBody,
} from '../../packages/contracts/src/generated/validators/public/tasks';

// Pins what the consumers of the task contracts rely on: the shared enumerations of
// @cadenway/contracts in every generated entry point, the defaults a creation fills, the pattern
// of keys and prefixes, the typed query parameters, the sets a later version may grow, and the
// first eight events of task-service. The access, archive and trash contracts are pinned by
// tests/contracts/task-access.spec.ts.

/**
 * Constant ORGANIZATION_ID
 *
 * @description
 * UUID v7 standing for Atelier Nord, the organization of the mockup data.
 *
 * @type {string}
 */
const ORGANIZATION_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b2f';

/**
 * Constant CAMILLE_ID
 *
 * @description
 * UUID v7 standing for the account of Camille Martin.
 *
 * @type {string}
 */
const CAMILLE_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

/**
 * Constant HUGO_ID
 *
 * @description
 * UUID v7 standing for the account of Hugo Dubois.
 *
 * @type {string}
 */
const HUGO_ID: string = '019a5f3c-a0b1-7c2d-9e3f-5a6b7c8d9e32';

/**
 * Constant SPRINT_14_ID
 *
 * @description
 * UUID v7 standing for the list "Sprint 14" of the space "Produit".
 *
 * @type {string}
 */
const SPRINT_14_ID: string = '019a7001-2b3c-7d4e-8f5a-6b7c8d9e0f12';

/**
 * Constant taskAssigned
 *
 * @description
 * Payload of `task.assigned.v1` for CAD-490, assigned to Hugo Dubois by Camille Martin.
 *
 * @type {TaskAssignedV1}
 */
const taskAssigned: TaskAssignedV1 = {
  id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d08',
  occurredAt: '2026-11-07T10:02:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 4,
  key: 'CAD-490',
  spaceId: '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01',
  listId: SPRINT_14_ID,
  parentKey: null,
  name: 'Journaliser les connexions SSO',
  status: 'todo',
  cancelReason: null,
  priority: 'moyenne',
  assigneeId: HUGO_ID,
  assigneeIds: [HUGO_ID, CAMILLE_ID],
  dueDate: '2026-11-20',
  startDate: null,
  estimateMinutes: null,
  labels: ['Auth', 'Back'],
  completedAt: null,
};

/**
 * Constant taskCancelled
 *
 * @description
 * Payload of `task.status-changed.v1` for CAD-457, cancelled as a duplicate.
 *
 * @type {TaskStatusChangedV1}
 */
const taskCancelled: TaskStatusChangedV1 = {
  id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d09',
  occurredAt: '2026-11-06T15:00:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 6,
  key: 'CAD-457',
  spaceId: '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01',
  listId: SPRINT_14_ID,
  parentKey: null,
  name: 'Ancien écran de connexion',
  status: 'cancelled',
  previousStatus: 'todo',
  cancelReason: 'duplicate',
  cancelNote: 'Remplacée par CAD-482',
  priority: 'basse',
  assigneeIds: [],
  dueDate: null,
  startDate: null,
  estimateMinutes: null,
  labels: [],
  completedAt: null,
};

describe('shared enumerations in the task contracts', () => {
  it('publishes the status keys, priorities and cancel reasons of @cadenway/contracts', () => {
    for (const keys of [StatusKey, SpacesStatusKey, ListsStatusKey, InternalStatusKey]) {
      expect(Object.values(keys)).toEqual([...STATUS_KEYS]);
    }
    for (const priorities of [PriorityKey, InternalPriorityKey]) {
      expect(Object.values(priorities)).toEqual([...PRIORITY_KEYS]);
    }
    for (const reasons of [CancelReason, InternalCancelReason]) {
      expect(Object.values(reasons)).toEqual([...CANCEL_REASONS]);
    }
    for (const categories of [StatusCategory, ListsStatusCategory]) {
      expect(Object.values(categories)).toEqual([...STATUS_CATEGORIES]);
    }
    expect(Object.values(ClientStatusKey)).toEqual([...STATUS_KEYS]);
    expect(Object.values(ClientPriorityKey)).toEqual([...PRIORITY_KEYS]);
    expect(Object.values(ClientCancelReason)).toEqual([...CANCEL_REASONS]);
  });

  it('declares the same values where a creation sets its own default', () => {
    expect(Object.values(TaskCreationStatus)).toEqual([...STATUS_KEYS]);
    expect(Object.values(SubtaskCreationStatus)).toEqual([...STATUS_KEYS]);
    expect(Object.values(TaskCreationPriority)).toEqual([...PRIORITY_KEYS]);
    expect(Object.values(SubtaskCreationPriority)).toEqual([...PRIORITY_KEYS]);
    expect(Object.values(SpaceCreationColor)).toEqual(Object.values(LookColor));
    expect(Object.values(ListCreationColor)).toEqual(Object.values(LookColor));
    expect(Object.values(SpaceCreationIcon)).toEqual(Object.values(LookIcon));
    expect(Object.values(ListCreationIcon)).toEqual(Object.values(LookIcon));
    expect(Object.values(SpaceCreationVisibility)).toEqual(Object.values(Visibility));
  });

  it('shows the ten statuses of every space, by key', () => {
    expect(Object.keys(GetSpaceResponse.shape.statuses.shape)).toEqual([...STATUS_KEYS]);
  });

  it('carries the same status keys, priorities and cancel reasons in the events', () => {
    const schema: (typeof eventSchemas)['task.assigned.v1'] = eventSchemas['task.assigned.v1'];

    expect(schema.shape.status.options).toEqual([...STATUS_KEYS]);
    expect(schema.shape.priority.options).toEqual([...PRIORITY_KEYS]);
    for (const cancelReason of [...CANCEL_REASONS, null]) {
      expect(schema.safeParse({ ...taskAssigned, cancelReason }).success).toBe(true);
    }
    expect(schema.safeParse({ ...taskAssigned, status: 'archived' }).success).toBe(false);
    expect(schema.safeParse({ ...taskAssigned, cancelReason: 'lost' }).success).toBe(false);
  });
});

describe('creations', () => {
  it('creates a task in "À faire", of priority "Moyenne", with nobody and nothing by default', () => {
    expect(CreateTaskBody.parse({ name: 'Ajouter la connexion par lien magique' })).toEqual({
      name: 'Ajouter la connexion par lien magique',
      status: 'todo',
      priority: 'moyenne',
      assigneeIds: [],
      labels: [],
      subtasks: [],
    });
    expect(CreateSubtaskBody.parse({ name: 'Tester la connexion avec Okta' })).toEqual({
      name: 'Tester la connexion avec Okta',
      status: 'todo',
      priority: 'moyenne',
      labels: [],
    });
  });

  it('bounds the subtasks, assignees and labels of a creation', () => {
    const name: string = 'Refondre l’écran de connexion SSO';

    expect(
      CreateTaskBody.safeParse({ name, subtasks: Array.from({ length: 25 }, () => ({ name })) })
        .success,
    ).toBe(true);
    expect(
      CreateTaskBody.safeParse({ name, subtasks: Array.from({ length: 26 }, () => ({ name })) })
        .success,
    ).toBe(false);
    expect(
      CreateTaskBody.safeParse({ name, assigneeIds: Array.from({ length: 21 }, () => CAMILLE_ID) })
        .success,
    ).toBe(false);
    expect(CreateTaskBody.safeParse({ name, labels: ['x'.repeat(33)] }).success).toBe(false);
  });

  it('creates a space with the initial, the gray and the whole organization by default', () => {
    expect(CreateSpaceBody.parse({ name: 'Ressources humaines', prefix: 'RH' })).toEqual({
      name: 'Ressources humaines',
      prefix: 'RH',
      icon: null,
      color: 'gris',
      visibility: 'organization',
    });
  });

  it('takes a prefix of 2 to 5 letters without accent', () => {
    for (const prefix of ['RH', 'CAD', 'ABCDE']) {
      expect(CreateSpaceBody.safeParse({ name: 'Produit', prefix }).success).toBe(true);
    }
    for (const prefix of ['R', 'ABCDEF', 'rh', 'RÉ', 'R1']) {
      expect(CreateSpaceBody.safeParse({ name: 'Produit', prefix }).success).toBe(false);
    }
  });

  it('makes a sprint only with its two dates', () => {
    expect(CreateListBody.parse({ name: 'Backlog' })).toEqual({
      name: 'Backlog',
      icon: null,
      color: 'gris',
    });
    expect(
      CreateListBody.safeParse({
        name: 'Sprint 15',
        sprint: { startDate: '2026-11-18', endDate: '2026-12-01' },
      }).success,
    ).toBe(true);
    expect(
      CreateListBody.safeParse({ name: 'Sprint 15', sprint: { startDate: '2026-11-18' } }).success,
    ).toBe(false);
  });
});

describe('changes', () => {
  it('names a task by a key that never starts with zero', () => {
    expect(GetTaskParams.parse({ taskKey: 'CAD-482' })).toEqual({ taskKey: 'CAD-482' });
    for (const taskKey of ['cad-482', 'CAD-0', 'CAD-0482', 'CAD482', 'CADENCE-1']) {
      expect(GetTaskParams.safeParse({ taskKey }).success).toBe(false);
    }
  });

  it('clears the parent, the dates and the estimate of a task with null', () => {
    expect(
      UpdateTaskBody.parse({
        parentKey: null,
        dueDate: null,
        startDate: null,
        estimateMinutes: null,
      }),
    ).toEqual({ parentKey: null, dueDate: null, startDate: null, estimateMinutes: null });
    expect(UpdateTaskBody.safeParse({ estimateMinutes: 90.5 }).success).toBe(false);
  });

  it('renames, hides or resets the statuses of a space', () => {
    const patch: Record<string, unknown> = {
      statuses: { review: { name: 'Relecture' }, testing: { hidden: true }, triage: null },
    };

    expect(UpdateSpaceBody.parse(patch)).toEqual(patch);
    expect(UpdateSpaceBody.parse({ statuses: null })).toEqual({ statuses: null });
    expect(
      UpdateSpaceBody.safeParse({ statuses: { review: { name: 'x'.repeat(25) } } }).success,
    ).toBe(false);
  });

  it('changes the assignees and the labels through their own routes, never by the patch', () => {
    expect(
      UpdateTaskBody.parse({
        name: 'Refondre l’écran',
        assigneeIds: [CAMILLE_ID],
        labels: ['Auth'],
      }),
    ).toEqual({ name: 'Refondre l’écran' });
    expect(AssignTaskParams.parse({ taskKey: 'CAD-482', userId: HUGO_ID })).toEqual({
      taskKey: 'CAD-482',
      userId: HUGO_ID,
    });
    expect(AssignTaskParams.safeParse({ taskKey: 'CAD-482', userId: 'me' }).success).toBe(false);
    expect(AddTaskLabelBody.parse({ name: 'Sécurité' })).toEqual({ name: 'Sécurité' });
    expect(AddTaskLabelBody.safeParse({ name: 'x'.repeat(33) }).success).toBe(false);
  });

  it('makes a sprint a list again with null, and changes its dates only together', () => {
    expect(UpdateListBody.parse({ sprint: null })).toEqual({ sprint: null });
    expect(UpdateListBody.safeParse({ sprint: { goal: 'Ouvrir la facturation' } }).success).toBe(
      false,
    );
  });
});

describe('queries', () => {
  it('reads the filters of a list as typed values, with their defaults', () => {
    expect(
      ListTasksQueryParams.parse({
        status: ['progress', 'review'],
        assignee: ['me', 'none', HUGO_ID],
        limit: '20',
      }),
    ).toEqual({
      status: ['progress', 'review'],
      assignee: ['me', 'none', HUGO_ID],
      level: 'roots',
      sort: 'manual',
      limit: 20,
    });
    expect(ListTasksInternalQueryParams.parse({ sort: '-dueDate' })).toMatchObject({
      sort: '-dueDate',
    });
  });

  it('refuses an unknown status, assignee or order', () => {
    expect(ListTasksQueryParams.safeParse({ status: ['archived'] }).success).toBe(false);
    expect(ListTasksQueryParams.safeParse({ assignee: ['moi'] }).success).toBe(false);
    expect(ListTasksQueryParams.safeParse({ sort: 'status' }).success).toBe(false);
    expect(ListTasksQueryParams.safeParse({ dueFrom: '08/11/2026' }).success).toBe(false);
  });

  it('needs the date of the caller for the counts of the day', () => {
    expect(GetHomeQueryParams.parse({ today: '2026-11-08' })).toEqual({ today: '2026-11-08' });
    expect(GetHomeQueryParams.safeParse({}).success).toBe(false);
    expect(GetHomeInternalQueryParams.safeParse({ today: '2026-11-31' }).success).toBe(false);
  });
});

describe('sets a later version may grow', () => {
  it('reads an activity entry of a kind and an actor this version does not know', () => {
    const page: Record<string, unknown> = {
      items: [
        {
          id: '019a7004-5e6f-7a8b-9c0d-1e2f3a4b5c30',
          occurredAt: '2026-11-08T08:12:00Z',
          kind: 'comment',
          actor: { type: 'form', id: 'formulaire-public' },
          task: { key: 'CAD-482', name: 'Refondre l’écran de connexion SSO', status: 'progress' },
          listId: SPRINT_14_ID,
        },
      ],
      nextCursor: null,
      total: 1,
    };

    expect(ListListActivityResponse.safeParse(page).success).toBe(true);
  });

  it('reads a detail that names a missing part', () => {
    const detail: unknown = GetTaskDetailResponse.shape.partial.parse(['comments', 'reviews']);

    expect(detail).toEqual(['comments', 'reviews']);
  });
});

describe('events of task-service', () => {
  it('keeps the first eight events and restricts none of them', () => {
    expect(EVENT_NAMES).toEqual(
      expect.arrayContaining([
        'list.created.v1',
        'list.updated.v1',
        'space.created.v1',
        'space.updated.v1',
        'task.assigned.v1',
        'task.created.v1',
        'task.status-changed.v1',
        'task.updated.v1',
      ]),
    );
    expect(RESTRICTED_EVENT_NAMES).toEqual([]);
  });

  it('accepts future template actions in the extensible event vocabulary', () => {
    const schema: (typeof eventSchemas)['space.task-template-changed.v1'] =
      eventSchemas['space.task-template-changed.v1'];
    expect(schema.shape.action.parse('created')).toBe('created');
    expect(schema.shape.action.parse('renamed')).toBe('renamed');
  });

  it('accepts optional collaboration snapshots without requiring them on older facts', () => {
    for (const schema of [eventSchemas['task.created.v1'], eventSchemas['task.updated.v1']]) {
      expect(schema.shape.milestone.safeParse(undefined).success).toBe(true);
      expect(schema.shape.milestone.parse(true)).toBe(true);
      expect(schema.shape.recurrence.safeParse(undefined).success).toBe(true);
      expect(schema.shape.recurrence.parse('weekly')).toBe('weekly');
      expect(schema.shape.recurrence.safeParse('yearly').success).toBe(false);
    }
    const statusSchema: (typeof eventSchemas)['task.status-changed.v1'] =
      eventSchemas['task.status-changed.v1'];
    expect(statusSchema.parse(taskCancelled)).toEqual(taskCancelled);
    expect(statusSchema.parse({ ...taskCancelled, watcherIds: [CAMILLE_ID] })).toMatchObject({
      watcherIds: [CAMILLE_ID],
    });
  });

  it('names the person added and every assignee after the change', () => {
    const schema: (typeof eventSchemas)['task.assigned.v1'] = eventSchemas['task.assigned.v1'];

    expect(schema.parse(taskAssigned)).toEqual(taskAssigned);
    expect(schema.safeParse({ ...taskAssigned, assigneeIds: [] }).success).toBe(false);
  });

  it('carries the status before and after, and the reason of a cancellation', () => {
    const schema: (typeof eventSchemas)['task.status-changed.v1'] =
      eventSchemas['task.status-changed.v1'];

    expect(schema.parse(taskCancelled)).toEqual(taskCancelled);
    expect(schema.safeParse({ ...taskCancelled, cancelReason: 'lost' }).success).toBe(false);
    const withoutPrevious: Partial<TaskStatusChangedV1> = { ...taskCancelled };
    delete withoutPrevious.previousStatus;
    expect(schema.safeParse(withoutPrevious).success).toBe(false);
  });
});

describe('task collaboration contracts', () => {
  it('validates comment length in Unicode code points on both boundaries', () => {
    for (const schema of [CreateTaskCommentBody, CreateTaskCommentInternalBody]) {
      expect(schema.safeParse({ body: '😀'.repeat(5000) }).success).toBe(true);
      expect(schema.safeParse({ body: '😀'.repeat(5001) }).success).toBe(false);
      expect(schema.safeParse({ body: '   ' }).success).toBe(false);
    }
    for (const schema of [UpdateTaskCommentBody, UpdateTaskCommentInternalBody]) {
      expect(schema.safeParse({ body: '😀'.repeat(5000) }).success).toBe(true);
      expect(schema.safeParse({ body: '😀'.repeat(5001) }).success).toBe(false);
      expect(schema.parse({ body: 'ok', ignored: true })).toEqual({ body: 'ok' });
    }
    expect(UpdateTaskCommentHeader.safeParse({}).success).toBe(false);
  });

  it('requires empty watcher bodies and the page metadata', () => {
    for (const schema of [FollowTaskWatcherBody, FollowTaskWatcherInternalBody]) {
      expect(schema.safeParse({}).success).toBe(true);
      expect(schema.safeParse({ extra: true }).success).toBe(false);
    }
    expect(
      ListTaskCommentsResponse.safeParse({ items: [], nextCursor: null, total: 0 }).success,
    ).toBe(true);
    expect(ListTaskParticipantsResponse.safeParse({ items: [], nextCursor: null }).success).toBe(
      true,
    );
    expect(
      ListTaskWatchersResponse.safeParse({
        items: [],
        nextCursor: null,
        total: 0,
        callerFollows: false,
      }).success,
    ).toBe(true);
    expect(
      ListTaskWatchersResponse.safeParse({ items: [], nextCursor: null, total: 0 }).success,
    ).toBe(false);
  });
});

describe('dependencies, milestones and recurrence', () => {
  it('shares recurrence values and accepts the new task input without changing old requests', () => {
    expect(Object.values(Recurrence)).toEqual([...RECURRENCES]);
    expect(
      CreateTaskBody.safeParse({
        name: 'CAD',
        milestone: true,
        recurrence: 'weekly',
        checklist: [{ text: 'Maquette validée' }],
      }).success,
    ).toBe(true);
    expect(CreateTaskBody.safeParse({ name: 'CAD' }).success).toBe(true);
    expect(
      UpdateTaskBody.safeParse({ recurrence: 'monthly', descriptionMentions: [] }).success,
    ).toBe(true);
    expect(UpdateTaskBody.safeParse({ recurrence: 'yearly' }).success).toBe(false);
    expect(
      CreateTaskDependencyBody.safeParse({ otherTaskKey: 'CAD-482', direction: 'blocked-by' })
        .success,
    ).toBe(true);
    expect(
      CreateTaskDependencyBody.safeParse({ otherTaskKey: 'CAD-482', direction: 'unknown' }).success,
    ).toBe(false);
  });

  it('parses both HTTP boolean spellings in public and internal task filters', () => {
    for (const schema of [ListTasksQueryParams, ListTasksInternalQueryParams]) {
      expect(schema.parse({ milestone: 'false' }).milestone).toBe(false);
      expect(schema.parse({ milestone: 'true' }).milestone).toBe(true);
      expect(schema.safeParse({ milestone: 'yes' }).success).toBe(false);
    }
    for (const schema of [CountTaskGroupsQueryParams, CountTaskGroupsInternalQueryParams]) {
      expect(schema.parse({ milestone: 'false', groupBy: 'status' }).milestone).toBe(false);
      expect(schema.safeParse({ milestone: 'yes', groupBy: 'status' }).success).toBe(false);
    }
    expect(
      ListTaskActivityQueryParams.safeParse({
        kind: ['create', 'status', 'priority', 'due', 'assign', 'comment'],
      }).success,
    ).toBe(true);
    expect(ListListActivityQueryParams.safeParse({ kind: ['comment'] }).success).toBe(true);
    expect(
      GetTaskDetailResponse.shape.comments.safeParse({ items: [], nextCursor: null, total: 0 })
        .success,
    ).toBe(true);
  });

  it('requires milestone page items to have a true milestone flag', () => {
    const task: Record<string, unknown> = {
      key: 'CAD-482',
      name: 'Refondre l’écran de connexion SSO',
      status: 'todo',
      cancelReason: null,
      priority: 'haute',
      assignees: [],
      dueDate: null,
      startDate: null,
      estimateMinutes: null,
      labels: [],
      parentKey: null,
      listId: SPRINT_14_ID,
      spaceId: '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01',
      subtaskCounts: { total: 0, closed: 0 },
      checklistCounts: { total: 0, done: 0 },
      completedAt: null,
      createdAt: '2026-11-08T10:40:00Z',
      version: 1,
    };
    for (const schema of [ListSpaceMilestonesResponse, ListSpaceMilestonesInternalResponse]) {
      expect(
        schema.safeParse({ items: [{ ...task, milestone: true }], nextCursor: null, total: 1 })
          .success,
      ).toBe(true);
      expect(
        schema.safeParse({ items: [{ ...task, milestone: false }], nextCursor: null, total: 1 })
          .success,
      ).toBe(false);
      expect(schema.safeParse({ items: [task], nextCursor: null, total: 1 }).success).toBe(false);
    }
  });
});

describe('task and list copies and bulk actions', () => {
  it('accepts only empty copy bodies at both boundaries', () => {
    for (const schema of [
      DuplicateTaskBody,
      DuplicateListBody,
      DuplicateTaskInternalBody,
      DuplicateListInternalBody,
    ]) {
      expect(schema.safeParse({}).success).toBe(true);
      expect(schema.safeParse({ unexpected: true }).success).toBe(false);
    }
  });

  it('validates tagged actions, bounded distinct keys and ambiguous members', () => {
    const selection: { taskKey: string; version?: number }[] = [
      { taskKey: 'CAD-482', version: 12 },
    ];
    const actions: Record<string, unknown>[] = [
      { type: 'status', status: 'done' },
      { type: 'priority', priority: 'haute' },
      { type: 'assign', userId: CAMILLE_ID },
      { type: 'unassign', userId: CAMILLE_ID },
      { type: 'move', listId: SPRINT_14_ID },
      { type: 'trash' },
      { type: 'duplicate' },
    ];
    for (const schema of [ExecuteBulkTaskActionBody, ExecuteBulkTaskActionInternalBody]) {
      for (const action of actions)
        expect(schema.safeParse({ selection, action }).success).toBe(true);
      expect(schema.safeParse({ selection: [], action: { type: 'trash' } }).success).toBe(false);
      expect(
        schema.safeParse({
          selection: Array.from({ length: 51 }, (_, index) => ({
            taskKey: `CAD-${String(index + 1)}`,
          })),
          action: { type: 'trash' },
        }).success,
      ).toBe(false);
      expect(
        schema.safeParse({
          selection: [...selection, { taskKey: 'CAD-482', version: 13 }],
          action: { type: 'trash' },
        }).success,
      ).toBe(false);
      expect(
        schema.safeParse({ selection, action: { type: 'trash', priority: 'haute' } }).success,
      ).toBe(false);
      expect(schema.safeParse({ selection, action: { type: 'assign' } }).success).toBe(false);
      expect(schema.safeParse({ selection, action: { type: 'unknown' } }).success).toBe(false);
    }
  });
});

describe('templates, saved views and favorites', () => {
  it('accepts scoped template requests and enforces the name bound by code point', () => {
    for (const schema of [CreateTaskTemplateBody, CreateTaskTemplateInternalBody]) {
      expect(schema.safeParse({ sourceTaskKey: 'CAD-482', name: '😀'.repeat(80) }).success).toBe(
        true,
      );
      expect(schema.safeParse({ sourceTaskKey: 'CAD-482', name: '😀'.repeat(81) }).success).toBe(
        false,
      );
      expect(schema.safeParse({ sourceTaskKey: 'CAD-482', name: ' ' }).success).toBe(false);
    }
  });

  it('uses task sort vocabulary and preserves nested merge patches', () => {
    expect(Object.values(SavedViewSort)).toEqual(Object.values(TaskSortParameter));
    const configuration: Record<string, unknown> = {
      layout: 'table',
      filters: { assignee: ['me'], priority: ['haute'] },
      sort: '-dueDate',
      groupBy: null,
      presentation: {
        hiddenBoardStatusKeys: ['done'],
        hiddenSheetColumns: ['spent'],
        sheetSort: { column: 'points', direction: 'desc' },
      },
    };
    for (const schema of [CreateSavedViewBody, CreateSavedViewInternalBody]) {
      expect(schema.safeParse({ name: 'Bugs critiques', icon: 'bug', configuration }).success).toBe(
        true,
      );
      expect(
        schema.safeParse({
          name: 'Bugs critiques',
          configuration: { ...configuration, sort: undefined },
        }).success,
      ).toBe(false);
      expect(schema.safeParse({ name: '😀'.repeat(81), configuration }).success).toBe(false);
      expect(
        schema.safeParse({ name: 'Bugs critiques', icon: 'future-icon', configuration }).success,
      ).toBe(false);
    }
    for (const schema of [UpdateSavedViewBody, UpdateSavedViewInternalBody]) {
      const patch: Record<string, unknown> = {
        configuration: {
          groupBy: null,
          filters: { priority: null },
          presentation: { sheetSort: { direction: 'asc' } },
        },
      };
      expect(schema.parse(patch)).toEqual(patch);
      expect(schema.safeParse({ icon: 'future-icon' }).success).toBe(false);
      expect(schema.parse({ configuration: { layout: 'board' }, unknown: true })).toEqual({
        configuration: { layout: 'board' },
      });
    }
    for (const schema of [DuplicateSavedViewBody, DuplicateSavedViewInternalBody]) {
      expect(schema.safeParse({}).success).toBe(true);
      expect(schema.safeParse({ extra: true }).success).toBe(false);
    }
    expect(
      GetSavedViewResponse.safeParse({
        id: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f01',
        listId: SPRINT_14_ID,
        name: 'Bugs critiques',
        icon: 'future-icon',
        configuration: {
          ...configuration,
          layout: 'future-layout',
          sort: 'future-sort',
          groupBy: 'future-group',
        },
        createdAt: '2026-11-08T10:40:00Z',
        updatedAt: '2026-11-08T10:40:00Z',
        version: 1,
      }).success,
    ).toBe(true);
  });

  it('accepts only supported favorite target kinds on creation and returns visible targets', () => {
    for (const schema of [CreateFavoriteBody, CreateFavoriteInternalBody]) {
      expect(
        schema.safeParse({ kind: 'saved-view', targetId: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f01' })
          .success,
      ).toBe(true);
      expect(
        schema.safeParse({ kind: 'task', targetId: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f01' })
          .success,
      ).toBe(false);
    }
    expect(
      GetFavoriteResponse.safeParse({
        id: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f02',
        kind: 'list',
        targetId: SPRINT_14_ID,
        target: { name: 'Sprint 14', href: '/v1/lists/019a7001-2b3c-7d4e-8f5a-6b7c8d9e0f12' },
        createdAt: '2026-11-08T10:40:00Z',
        version: 1,
      }).success,
    ).toBe(true);
  });
});

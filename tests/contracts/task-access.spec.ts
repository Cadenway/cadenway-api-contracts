import { describe, expect, it } from 'vitest';

import { AccessRole as ClientAccessRole } from '../../packages/api-client/src/generated/public/spaces/model/accessRole';
import {
  EVENT_NAMES,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type ListAccessChangedV1,
  type TaskTrashedV1,
} from '../../packages/contracts/src/generated/events/task-service';
import { AccessRole as InternalAccessRole } from '../../packages/contracts/src/generated/types/internal/task-service';
import { AccessRole as AccessAccessRole } from '../../packages/contracts/src/generated/types/public/access';
import { AccessRole as SpacesAccessRole } from '../../packages/contracts/src/generated/types/public/spaces';
import {
  CheckTaskAccessInternalResponse,
  CreateAccessRequestInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  ApproveAccessRequestBody,
  CreateAccessRequestBody,
  CreateAccessRequestResponse,
  ListAccessRequestsResponse,
  ListListGrantsResponse,
  SetListGrantBody,
  SetSpaceGrantParams,
} from '../../packages/contracts/src/generated/validators/public/access';
import {
  ArchiveTaskResponse,
  ListArchivedTasksResponse,
} from '../../packages/contracts/src/generated/validators/public/archives';
import {
  CreateListBody,
  GetListResponse,
  UpdateListBody,
} from '../../packages/contracts/src/generated/validators/public/lists';
import { GetSpaceResponse } from '../../packages/contracts/src/generated/validators/public/spaces';
import { GetTaskResponse } from '../../packages/contracts/src/generated/validators/public/tasks';
import {
  EmptyTrashResponse,
  ListTrashResponse,
  PurgeTrashEntryResponse,
  TrashTaskResponse,
} from '../../packages/contracts/src/generated/validators/public/trash';

// Pins what P3b-1 promises the consumers of the task contracts: the three roles of a grant, read
// as an open set, the access request that answers the same whatever its target, every member
// added to a resource optional in requests and responses alike, archives and trash kept apart
// from the closed status set, and the access, archive and trash events inside the families the
// NATS user `task` already publishes.

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
 * UUID v7 standing for the account of Camille Martin, owner of the space "Produit".
 *
 * @type {string}
 */
const CAMILLE_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

/**
 * Constant NADIA_ID
 *
 * @description
 * UUID v7 standing for the account of Nadia Benali, a guest of Atelier Nord.
 *
 * @type {string}
 */
const NADIA_ID: string = '019a6f00-1b2c-7d3e-8f4a-5b6c7d8e9f40';

/**
 * Constant SPACE_ID
 *
 * @description
 * UUID v7 standing for the space "Produit".
 *
 * @type {string}
 */
const SPACE_ID: string = '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01';

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
 * Constant STATUSES
 *
 * @description
 * The ten statuses of a space as P3a reads them, each with its category, default label and use.
 *
 * @type {Record<string, unknown>}
 */
const STATUSES: Record<string, unknown> = {
  triage: { category: 'open', name: null, hidden: false },
  backlog: { category: 'open', name: null, hidden: false },
  todo: { category: 'open', name: null, hidden: false },
  progress: { category: 'active', name: null, hidden: false },
  review: { category: 'active', name: null, hidden: false },
  testing: { category: 'active', name: null, hidden: false },
  waiting: { category: 'active', name: null, hidden: false },
  blocked: { category: 'active', name: null, hidden: false },
  done: { category: 'closed', name: null, hidden: false },
  cancelled: { category: 'closed', name: null, hidden: false },
};

/**
 * Constant SPACE_P3A
 *
 * @description
 * The space "Produit" as a task-service of P3a answers it, without the role of the caller.
 *
 * @type {Record<string, unknown>}
 */
const SPACE_P3A: Record<string, unknown> = {
  id: SPACE_ID,
  name: 'Produit',
  prefix: 'CAD',
  description: null,
  icon: 'rocket',
  color: 'violet',
  visibility: 'organization',
  owner: { userId: CAMILLE_ID },
  statuses: STATUSES,
  nextKey: 'CAD-732',
  createdAt: '2026-03-02T09:30:00Z',
  version: 4,
};

/**
 * Constant LIST_P3A
 *
 * @description
 * Sprint 14 as a task-service of P3a answers it, without the switch, the archive or the role.
 *
 * @type {Record<string, unknown>}
 */
const LIST_P3A: Record<string, unknown> = {
  id: SPRINT_14_ID,
  spaceId: SPACE_ID,
  name: 'Sprint 14',
  icon: 'lightning',
  color: 'violet',
  sprint: { startDate: '2026-11-03', endDate: '2026-11-17', goal: null },
  createdAt: '2026-10-30T16:00:00Z',
  version: 2,
};

/**
 * Constant TASK_P3A
 *
 * @description
 * CAD-482 as a task-service of P3a answers it, without `archivedAt` and `archivedBy`.
 *
 * @type {Record<string, unknown>}
 */
const TASK_P3A: Record<string, unknown> = {
  key: 'CAD-482',
  name: 'Refondre l’écran de connexion SSO',
  description: null,
  status: 'progress',
  cancelReason: null,
  cancelNote: null,
  priority: 'haute',
  assignees: [{ userId: CAMILLE_ID }],
  dueDate: '2026-11-12',
  startDate: null,
  estimateMinutes: 480,
  labels: ['Auth', 'Front'],
  parentKey: null,
  listId: SPRINT_14_ID,
  spaceId: SPACE_ID,
  subtaskCounts: { total: 3, closed: 1 },
  checklist: [],
  checklistCounts: { total: 0, done: 0 },
  completedAt: null,
  createdAt: '2026-11-03T09:00:00Z',
  createdBy: { type: 'user', id: CAMILLE_ID },
  updatedAt: '2026-11-07T15:20:00Z',
  version: 12,
};

/**
 * Constant TRASH_ENTRY
 *
 * @description
 * The trash entry of CAD-452, deleted by Camille Martin from Sprint 14.
 *
 * @type {Record<string, unknown>}
 */
const TRASH_ENTRY: Record<string, unknown> = {
  id: '019a7006-7a8b-7c9d-8e0f-1a2b3c4d5e01',
  task: { key: 'CAD-452', name: 'Ancien écran de connexion', status: 'cancelled' },
  parentKey: null,
  subtaskCount: 0,
  list: { id: SPRINT_14_ID, spaceId: SPACE_ID, name: 'Sprint 14', state: 'active' },
  trashedAt: '2026-11-06T16:20:00Z',
  trashedBy: { type: 'user', id: CAMILLE_ID },
  purgeAt: '2026-12-06T16:20:00Z',
};

/**
 * Constant listAccessChanged
 *
 * @description
 * Payload of `list.access-changed.v1` for Sprint 14, shared with the guest Nadia Benali.
 *
 * @type {ListAccessChangedV1}
 */
const listAccessChanged: ListAccessChangedV1 = {
  id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d11',
  occurredAt: '2026-11-08T10:45:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 6,
  listId: SPRINT_14_ID,
  spaceId: SPACE_ID,
  organizationAccess: true,
  grants: [{ userId: NADIA_ID, role: 'comment' }],
  changed: ['grants'],
  changedUserIds: [NADIA_ID],
};

/**
 * Constant taskTrashed
 *
 * @description
 * Payload of `task.trashed.v1` for CAD-452, the root of its trash entry.
 *
 * @type {TaskTrashedV1}
 */
const taskTrashed: TaskTrashedV1 = {
  id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d26',
  occurredAt: '2026-11-06T16:20:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 8,
  key: 'CAD-452',
  entryId: '019a7006-7a8b-7c9d-8e0f-1a2b3c4d5e01',
  rootKey: 'CAD-452',
  purgeAt: '2026-12-06T16:20:00Z',
  spaceId: SPACE_ID,
  listId: SPRINT_14_ID,
  parentKey: null,
  name: 'Ancien écran de connexion',
  status: 'cancelled',
  cancelReason: 'duplicate',
  priority: 'basse',
  assigneeIds: [],
  dueDate: null,
  startDate: null,
  estimateMinutes: null,
  labels: ['Front'],
  completedAt: null,
};

describe('roles of a grant', () => {
  it('gives "Peut modifier", "Peut commenter" or "Lecture seule", in every generated entry point', () => {
    for (const roles of [
      SpacesAccessRole,
      AccessAccessRole,
      InternalAccessRole,
      ClientAccessRole,
    ]) {
      expect(Object.values(roles)).toEqual(['edit', 'comment', 'view']);
    }
    for (const role of ['edit', 'comment', 'view']) {
      expect(SetListGrantBody.parse({ role })).toEqual({ role });
    }
    for (const role of ['owner', 'admin', 'Lecture seule']) {
      expect(SetListGrantBody.safeParse({ role }).success).toBe(false);
    }
    expect(ApproveAccessRequestBody.safeParse({}).success).toBe(false);
  });

  it('names the person given access by account', () => {
    expect(SetSpaceGrantParams.safeParse({ spaceId: SPACE_ID, userId: NADIA_ID }).success).toBe(
      true,
    );
    expect(SetSpaceGrantParams.safeParse({ spaceId: SPACE_ID, userId: 'me' }).success).toBe(false);
  });

  it('reads a role, a list state and a request state a later version may add', () => {
    const grants: Record<string, unknown> = {
      items: [
        {
          userId: NADIA_ID,
          role: 'approve',
          grantedAt: '2026-11-04T10:00:00Z',
          grantedBy: { type: 'user', id: CAMILLE_ID },
        },
      ],
      nextCursor: null,
      total: 1,
    };

    expect(ListListGrantsResponse.safeParse(grants).success).toBe(true);
    expect(
      ListTrashResponse.safeParse({
        items: [{ ...TRASH_ENTRY, list: { ...(TRASH_ENTRY['list'] as object), state: 'frozen' } }],
        nextCursor: null,
        total: 1,
      }).success,
    ).toBe(true);
    expect(
      ListAccessRequestsResponse.safeParse({
        items: [
          {
            id: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f01',
            target: 'view',
            spaceId: SPACE_ID,
            listId: null,
            task: null,
            requester: { userId: NADIA_ID },
            message: null,
            state: 'withdrawn',
            role: null,
            createdAt: '2026-11-08T11:02:00Z',
            decidedAt: null,
            decidedBy: null,
          },
        ],
        nextCursor: null,
        total: 1,
      }).success,
    ).toBe(true);
    expect(
      CheckTaskAccessInternalResponse.parse({
        role: 'comment',
        spaceId: SPACE_ID,
        listId: SPRINT_14_ID,
        taskKey: 'CAD-482',
      }),
    ).toEqual({ role: 'comment', spaceId: SPACE_ID, listId: SPRINT_14_ID, taskKey: 'CAD-482' });
  });
});

describe('access requests', () => {
  it('answers with no body, whether the target exists or not', () => {
    expect(CreateAccessRequestResponse.safeParse(undefined).success).toBe(true);
    expect(CreateAccessRequestResponse.safeParse({ stored: true }).success).toBe(false);
    expect(CreateAccessRequestInternalResponse.safeParse(undefined).success).toBe(true);
  });

  it('takes a space, a list or a task key with a message of 500 characters at most', () => {
    expect(CreateAccessRequestBody.safeParse({ spaceId: SPACE_ID }).success).toBe(true);
    expect(CreateAccessRequestBody.safeParse({ listId: SPRINT_14_ID, message: null }).success).toBe(
      true,
    );
    expect(
      CreateAccessRequestBody.safeParse({ taskKey: 'DIR-12', message: 'x'.repeat(500) }).success,
    ).toBe(true);
    expect(
      CreateAccessRequestBody.safeParse({ taskKey: 'DIR-12', message: 'x'.repeat(501) }).success,
    ).toBe(false);
    expect(CreateAccessRequestBody.safeParse({ taskKey: 'dir-12' }).success).toBe(false);
  });
});

describe('members added to existing resources', () => {
  it('stay optional in the requests, without a default the validator would fill', () => {
    expect(CreateListBody.parse({ name: 'Backlog' })).toEqual({
      name: 'Backlog',
      icon: null,
      color: 'gris',
    });
    expect(CreateListBody.parse({ name: 'Budget', organizationAccess: false })).toMatchObject({
      organizationAccess: false,
    });
    expect(UpdateListBody.parse({ organizationAccess: false })).toEqual({
      organizationAccess: false,
    });
    expect(UpdateListBody.safeParse({ organizationAccess: 'off' }).success).toBe(false);
  });

  it('stay optional in the responses, so that an answer of P3a still reads', () => {
    expect(GetSpaceResponse.safeParse(SPACE_P3A).success).toBe(true);
    expect(GetListResponse.safeParse(LIST_P3A).success).toBe(true);
    expect(GetTaskResponse.safeParse(TASK_P3A).success).toBe(true);
  });

  it('carry the role of the caller, the switch and the archive once task-service sends them', () => {
    expect(
      GetSpaceResponse.parse({ ...SPACE_P3A, callerRole: null, callerCanManage: false }),
    ).toMatchObject({ callerRole: null, callerCanManage: false });
    expect(
      GetListResponse.parse({
        ...LIST_P3A,
        organizationAccess: false,
        archivedAt: '2026-11-03T09:00:00Z',
        archivedBy: { type: 'user', id: CAMILLE_ID },
        callerRole: 'edit',
      }),
    ).toMatchObject({ organizationAccess: false, callerRole: 'edit' });
    expect(
      ArchiveTaskResponse.parse({
        ...TASK_P3A,
        archivedAt: '2026-11-05T11:30:00Z',
        archivedBy: { type: 'user', id: CAMILLE_ID },
      }),
    ).toMatchObject({ archivedAt: '2026-11-05T11:30:00Z' });
  });
});

describe('archives and trash', () => {
  it('keep the ten statuses closed: archived and trashed are states of their own', () => {
    expect(TrashTaskResponse.parse(TRASH_ENTRY)).toEqual(TRASH_ENTRY);
    expect(
      TrashTaskResponse.safeParse({
        ...TRASH_ENTRY,
        task: { ...(TRASH_ENTRY['task'] as object), status: 'trashed' },
      }).success,
    ).toBe(false);
    expect(GetTaskResponse.safeParse({ ...TASK_P3A, status: 'archived' }).success).toBe(false);
    expect(
      ListArchivedTasksResponse.safeParse({ items: [], nextCursor: null, total: 0 }).success,
    ).toBe(true);
  });

  it('says when an entry is erased, and answers an erasure with no body', () => {
    const withoutPurge: Record<string, unknown> = Object.fromEntries(
      Object.entries(TRASH_ENTRY).filter(([name]: [string, unknown]) => name !== 'purgeAt'),
    );

    expect(TrashTaskResponse.safeParse(withoutPurge).success).toBe(false);
    expect(PurgeTrashEntryResponse.safeParse(undefined).success).toBe(true);
    expect(EmptyTrashResponse.parse({ entryCount: 2 })).toEqual({ entryCount: 2 });
  });
});

describe('events of access, archives and trash', () => {
  it('stay inside the families the NATS user task publishes, none restricted', () => {
    for (const name of EVENT_NAMES) {
      expect(name).toMatch(/^(space|list|task)\.[a-z-]+\.v1$/);
    }
    expect(EVENT_NAMES).toEqual(
      expect.arrayContaining([
        'space.access-changed.v1',
        'list.access-changed.v1',
        'space.access-requested.v1',
        'list.access-requested.v1',
        'task.access-requested.v1',
        'space.access-request-decided.v1',
        'list.access-request-decided.v1',
        'task.access-request-decided.v1',
        'space.deleted.v1',
        'space.restored.v1',
        'list.archived.v1',
        'list.unarchived.v1',
        'list.deleted.v1',
        'list.restored.v1',
        'task.archived.v1',
        'task.unarchived.v1',
        'task.trashed.v1',
        'task.restored.v1',
        'task.purged.v1',
      ]),
    );
    expect(EVENT_NAMES).toHaveLength(27);
    expect(RESTRICTED_EVENT_NAMES).toEqual([]);
  });

  it('carry every grant after a change of access, with roles a later version may add', () => {
    const schema: (typeof eventSchemas)['list.access-changed.v1'] =
      eventSchemas['list.access-changed.v1'];

    expect(schema.parse(listAccessChanged)).toEqual(listAccessChanged);
    expect(
      schema.safeParse({ ...listAccessChanged, grants: [{ userId: NADIA_ID, role: 'approve' }] })
        .success,
    ).toBe(true);
    expect(schema.safeParse({ ...listAccessChanged, changedUserIds: [] }).success).toBe(true);
    const withoutSwitch: Partial<ListAccessChangedV1> = { ...listAccessChanged };
    delete withoutSwitch.organizationAccess;
    expect(schema.safeParse(withoutSwitch).success).toBe(false);
  });

  it('name the trash entry and its root of every task moved to the trash', () => {
    const schema: (typeof eventSchemas)['task.trashed.v1'] = eventSchemas['task.trashed.v1'];

    expect(schema.parse(taskTrashed)).toEqual(taskTrashed);
    expect(schema.safeParse({ ...taskTrashed, status: 'trashed' }).success).toBe(false);
    for (const member of ['entryId', 'rootKey', 'purgeAt']) {
      const without: Record<string, unknown> = Object.fromEntries(
        Object.entries(taskTrashed).filter(([name]: [string, unknown]) => name !== member),
      );
      expect(schema.safeParse(without).success, member).toBe(false);
    }
  });

  it('name the target of a request, so that the notice needs no call back', () => {
    const schema: (typeof eventSchemas)['task.access-requested.v1'] =
      eventSchemas['task.access-requested.v1'];
    const requested: Record<string, unknown> = {
      id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d14',
      occurredAt: '2026-11-08T09:12:00Z',
      organizationId: ORGANIZATION_ID,
      actor: { type: 'user', id: NADIA_ID },
      version: 1,
      accessRequestId: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f02',
      spaceId: SPACE_ID,
      spaceName: 'Direction',
      listId: SPRINT_14_ID,
      listName: 'Budget',
      key: 'DIR-12',
      name: 'Budget 2027',
      requesterUserId: NADIA_ID,
      spaceOwnerUserId: CAMILLE_ID,
      message: null,
    };

    expect(schema.parse(requested)).toEqual(requested);
    for (const member of ['spaceName', 'listName', 'name', 'spaceOwnerUserId']) {
      const without: Record<string, unknown> = Object.fromEntries(
        Object.entries(requested).filter(([name]: [string, unknown]) => name !== member),
      );
      expect(schema.safeParse(without).success, member).toBe(false);
    }
  });

  it('gives the role of an approval, or none for a refusal', () => {
    const schema: (typeof eventSchemas)['list.access-request-decided.v1'] =
      eventSchemas['list.access-request-decided.v1'];
    const decided: Record<string, unknown> = {
      id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d16',
      occurredAt: '2026-11-08T14:31:00Z',
      organizationId: ORGANIZATION_ID,
      actor: { type: 'user', id: CAMILLE_ID },
      version: 2,
      accessRequestId: '019a7007-8b9c-7d0e-8f1a-2b3c4d5e6f03',
      spaceId: SPACE_ID,
      listId: SPRINT_14_ID,
      requesterUserId: NADIA_ID,
      decision: 'approved',
      role: 'comment',
    };

    expect(schema.parse(decided)).toEqual(decided);
    expect(schema.safeParse({ ...decided, decision: 'refused', role: null }).success).toBe(true);
    expect(schema.safeParse({ ...decided, version: 1 }).success).toBe(false);
  });

  it('reads a list created before the switch existed, and one created with it off', () => {
    const schema: (typeof eventSchemas)['list.created.v1'] = eventSchemas['list.created.v1'];
    const created: Record<string, unknown> = {
      id: '019a7005-6f7a-7b8c-9d0e-1f2a3b4c5d03',
      occurredAt: '2026-10-30T16:00:00Z',
      organizationId: ORGANIZATION_ID,
      actor: { type: 'user', id: CAMILLE_ID },
      version: 1,
      listId: SPRINT_14_ID,
      spaceId: SPACE_ID,
      name: 'Sprint 14',
      icon: 'lightning',
      color: 'violet',
      sprint: null,
    };

    expect(schema.safeParse(created).success).toBe(true);
    expect(schema.parse({ ...created, organizationAccess: false })).toMatchObject({
      organizationAccess: false,
    });
  });
});

import { describe, expect, it } from 'vitest';

import {
  eventSchemas,
  type ApprovalDecidedV1,
  type ApprovalRequestedV1,
} from '../../packages/contracts/src/generated/events/task-service';
import {
  GetTaskApprovalInternalResponse,
  RequestTaskApprovalInternalBody,
  RequestTaskApprovalInternalHeader,
  VoteOnTaskApprovalInternalBody,
  VoteOnTaskApprovalInternalHeader,
  WithdrawTaskApprovalVoteInternalHeader,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  GetTaskApprovalResponse,
  RequestTaskApprovalBody,
  RequestTaskApprovalHeader,
  VoteOnTaskApprovalBody,
  VoteOnTaskApprovalHeader,
  WithdrawTaskApprovalVoteHeader,
} from '../../packages/contracts/src/generated/validators/public/tasks';

describe.each([
  {
    surface: 'public',
    current: GetTaskApprovalResponse,
    request: RequestTaskApprovalBody,
    vote: VoteOnTaskApprovalBody,
    headers: [RequestTaskApprovalHeader, VoteOnTaskApprovalHeader, WithdrawTaskApprovalVoteHeader],
  },
  {
    surface: 'internal',
    current: GetTaskApprovalInternalResponse,
    request: RequestTaskApprovalInternalBody,
    vote: VoteOnTaskApprovalInternalBody,
    headers: [
      RequestTaskApprovalInternalHeader,
      VoteOnTaskApprovalInternalHeader,
      WithdrawTaskApprovalVoteInternalHeader,
    ],
  },
])('$surface task approval', (contract) => {
  it('reads a task with no current approval at its task version', () => {
    expect(
      contract.current.parse({
        taskKey: 'CAD-482',
        taskVersion: 12,
        taskStatus: 'progress',
        current: null,
      }),
    ).toEqual({ taskKey: 'CAD-482', taskVersion: 12, taskStatus: 'progress', current: null });
  });

  it('requires 1 to 20 different reviewers without letting the caller supply server-owned fields', () => {
    const reviewers: string[] = Array.from(
      { length: 21 },
      (_, index) => `019a5f3c-9e1f-7b2a-8c3d-${index.toString(16).padStart(12, '0')}`,
    );
    const twenty: string[] = reviewers.slice(0, 20);
    const reviewer: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

    expect(contract.request.parse({ reviewerUserIds: twenty })).toEqual({
      reviewerUserIds: twenty,
    });
    expect(contract.request.safeParse({ reviewerUserIds: [] }).success).toBe(false);
    expect(contract.request.safeParse({ reviewerUserIds: reviewers }).success).toBe(false);
    expect(contract.request.safeParse({ reviewerUserIds: [reviewer, reviewer] }).success).toBe(
      false,
    );
    expect(
      contract.request.safeParse({ reviewerUserIds: [reviewer, reviewer.toUpperCase()] }).success,
    ).toBe(false);
    expect(
      contract.request.safeParse({ reviewerUserIds: twenty, requesterUserId: reviewer }).success,
    ).toBe(false);
  });

  it('accepts reasons only for change requests and counts Unicode code points', () => {
    expect(contract.vote.parse({ decision: 'approved' })).toEqual({ decision: 'approved' });
    expect(contract.vote.safeParse({ decision: 'approved', reason: 'Déjà prêt.' }).success).toBe(
      false,
    );
    expect(contract.vote.safeParse({ decision: 'changes-requested' }).success).toBe(false);
    expect(
      contract.vote.safeParse({ decision: 'changes-requested', reason: ' \n\t' }).success,
    ).toBe(false);
    const reason: string = '💬'.repeat(5000);
    expect(contract.vote.parse({ decision: 'changes-requested', reason })).toEqual({
      decision: 'changes-requested',
      reason,
    });
    expect(
      contract.vote.safeParse({ decision: 'changes-requested', reason: reason + 'a' }).success,
    ).toBe(false);
    expect(contract.vote.safeParse({ decision: 'withdrawn' }).success).toBe(false);
  });

  it('requires a strong task version on every mutation', () => {
    for (const header of contract.headers) {
      expect(header.safeParse({ 'If-Match': '"13"' }).success).toBe(true);
      expect(header.safeParse({}).success).toBe(false);
      expect(header.safeParse({ 'If-Match': '*' }).success).toBe(false);
      expect(header.safeParse({ 'If-Match': 'W/"13"' }).success).toBe(false);
    }
  });
});

describe('task approval facts', () => {
  it('carries committed task version and round identity, with the reason through a comment link', () => {
    const fact: Omit<ApprovalRequestedV1, 'reviewerUserIds'> = {
      id: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b03',
      organizationId: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c30',
      spaceId: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31',
      listId: '019a7001-2b3c-7d4e-8f5a-6b7c8d9e0f12',
      actor: { type: 'user', id: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30' },
      key: 'CAD-482',
      version: 14,
      roundId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01',
      occurredAt: '2026-11-08T10:50:00Z',
    };
    const requested: ApprovalRequestedV1 = { ...fact, reviewerUserIds: [fact.actor.id] };
    const decided: ApprovalDecidedV1 = {
      ...fact,
      requesterUserId: fact.actor.id,
      decision: 'changes-requested',
      commentId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b02',
    };
    const withdrawn: ApprovalDecidedV1 = {
      ...decided,
      version: 15,
      decision: 'withdrawn',
      commentId: null,
    };

    expect(eventSchemas['approval.requested.v1'].parse(requested)).toEqual(requested);
    expect(eventSchemas['approval.decided.v1'].parse(decided)).toEqual(decided);
    expect(eventSchemas['approval.decided.v1'].parse(withdrawn)).toEqual(withdrawn);
  });
});

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import type {
  TaskStatusDurationSummary,
  TaskTimeEntry,
  TaskTimeEntryCreation,
} from '../../packages/contracts/src/generated/types/public/time';
import {
  CreateTaskTimeEntryInternalBody,
  CreateTaskTimeEntryInternalResponse,
  DeleteTaskTimeEntryInternalParams,
  GetTaskStatusDurationsInternalResponse,
  GetTaskTimeEntryInternalParams,
  GetTaskTimeEntryInternalResponse,
  GetTaskTimeSummaryInternalResponse,
  ListTaskTimeEntriesInternalQueryParams,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  CreateTaskTimeEntryBody,
  CreateTaskTimeEntryResponse,
  DeleteTaskTimeEntryParams,
  GetTaskStatusDurationsResponse,
  GetTaskTimeEntryParams,
  GetTaskTimeEntryResponse,
  GetTaskTimeSummaryResponse,
  ListTaskTimeEntriesQueryParams,
} from '../../packages/contracts/src/generated/validators/public/time';

describe.each([
  {
    side: 'public',
    create: CreateTaskTimeEntryBody,
    deleteParams: DeleteTaskTimeEntryParams,
    query: ListTaskTimeEntriesQueryParams,
    summary: GetTaskTimeSummaryResponse,
    durations: GetTaskStatusDurationsResponse,
  },
  {
    side: 'internal',
    create: CreateTaskTimeEntryInternalBody,
    deleteParams: DeleteTaskTimeEntryInternalParams,
    query: ListTaskTimeEntriesInternalQueryParams,
    summary: GetTaskTimeSummaryInternalResponse,
    durations: GetTaskStatusDurationsInternalResponse,
  },
])(
  '$side task time contract',
  ({
    create,
    deleteParams,
    query,
    summary,
    durations,
  }: {
    create: typeof CreateTaskTimeEntryBody;
    deleteParams: typeof DeleteTaskTimeEntryParams;
    query: typeof ListTaskTimeEntriesQueryParams;
    summary: typeof GetTaskTimeSummaryResponse;
    durations: typeof GetTaskStatusDurationsResponse;
  }) => {
    it('records 1 to 1440 whole minutes and validates the supplied calendar date', () => {
      expect(create.safeParse({ minutes: 1, workDate: '2028-02-29' }).success).toBe(true);
      expect(create.safeParse({ minutes: 1440, workDate: '2026-11-08' }).success).toBe(true);
      expect(create.safeParse({ minutes: 0, workDate: '2026-11-08' }).success).toBe(false);
      expect(create.safeParse({ minutes: 1.5, workDate: '2026-11-08' }).success).toBe(false);
      expect(create.safeParse({ minutes: 1441, workDate: '2026-11-08' }).success).toBe(false);
      expect(create.safeParse({ minutes: 45, workDate: '2026-02-29' }).success).toBe(false);
      expect(create.safeParse({ minutes: 45, workDate: '0000-01-01' }).success).toBe(false);
    });

    it('accepts a 500-code-point note and rejects a supplied author', () => {
      const input: TaskTimeEntryCreation = { minutes: 45, workDate: '2026-11-08' };
      const note: string = '\u{1F680}'.repeat(500);
      expect(create.safeParse({ ...input, note }).success).toBe(true);
      expect(create.safeParse({ ...input, note: note + 'a' }).success).toBe(false);
      expect(
        create.safeParse({ ...input, authorUserId: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31' })
          .success,
      ).toBe(false);
    });

    it('accepts UUID v7 entry identifiers and respects the shared cursor page bound', () => {
      expect(
        deleteParams.safeParse({
          taskKey: 'CAD-482',
          timeEntryId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01',
        }).success,
      ).toBe(true);
      expect(
        deleteParams.safeParse({
          taskKey: 'CAD-482',
          timeEntryId: '019a7003-4d5e-4f6a-8b9c-0d1e2f3a4b01',
        }).success,
      ).toBe(false);
      expect(query.parse({ cursor: 'next', limit: '100' })).toEqual({ cursor: 'next', limit: 100 });
      expect(query.safeParse({ limit: '101' }).success).toBe(false);
    });

    it('returns empty totals without an estimate, a null milestone summary and covered ordinary durations', () => {
      expect(summary.parse({ totalMinutes: 0, estimateMinutes: null })).toEqual({
        totalMinutes: 0,
        estimateMinutes: null,
      });
      expect(durations.parse({ summary: null })).toEqual({ summary: null });
      const covered: TaskStatusDurationSummary = {
        observedAt: '2026-11-08T10:00:00Z',
        coverageStartedAt: '2026-11-07T09:00:00Z',
        complete: false,
        durations: [{ status: 'done', durationMilliseconds: 90_000_000, active: false }],
      };
      expect(durations.parse({ summary: covered })).toEqual({ summary: covered });
      expect(
        durations.safeParse({
          summary: {
            ...covered,
            durations: [{ status: 'done', durationMilliseconds: -1, active: false }],
          },
        }).success,
      ).toBe(false);
    });
  },
);

it.each([
  {
    side: 'public',
    path: '../../openapi/public/time.yaml',
    createResponse: CreateTaskTimeEntryResponse,
    readParams: GetTaskTimeEntryParams,
    readResponse: GetTaskTimeEntryResponse,
  },
  {
    side: 'internal',
    path: '../../openapi/internal/task-service.yaml',
    createResponse: CreateTaskTimeEntryInternalResponse,
    readParams: GetTaskTimeEntryInternalParams,
    readResponse: GetTaskTimeEntryInternalResponse,
  },
])('the $side creation Location can be followed to read the same time entry', (contract) => {
  const spec: string = readFileSync(new URL(contract.path, import.meta.url), 'utf8');
  const location: string | undefined =
    /'((?:\/internal)?\/v1\/tasks\/[^/'{}]+\/time-entries\/[^/'{}]+)'/u.exec(spec)?.[1];
  expect(location).toBeDefined();
  const parameters: string[] | undefined = location?.split('/');
  const { taskKey, timeEntryId }: { taskKey: string; timeEntryId: string } =
    contract.readParams.parse({
      taskKey: parameters?.at(-3),
      timeEntryId: parameters?.at(-1),
    });
  const entry: TaskTimeEntry = contract.createResponse.parse({
    id: timeEntryId,
    taskKey,
    authorUserId: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31',
    minutes: 150,
    workDate: '2026-11-07',
    note: 'Maquette et détection du domaine',
    createdAt: '2026-11-07T13:10:00Z',
  });
  expect(contract.readResponse.parse(entry)).toEqual(entry);
});

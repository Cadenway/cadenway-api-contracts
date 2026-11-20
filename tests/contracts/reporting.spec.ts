import { describe, expect, it } from 'vitest';

import type { ListTaskExport } from '../../packages/contracts/src/generated/types/internal/task-service';
import { LookupMemberNamesInternalBody } from '../../packages/contracts/src/generated/validators/internal/organization-service';
import {
  ExportListTasksInternalResponse,
  GetTeamDashboardInternalQueryParams,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import { ExportListTasksResponse } from '../../packages/contracts/src/generated/validators/public/lists';
import { GetTeamDashboardQueryParams } from '../../packages/contracts/src/generated/validators/public/reports';

describe('list CSV representation', () => {
  it('validates public CSV text and the separate internal projection', () => {
    const header: string =
      '"Identifiant";"Nom";"Statut";"Priorité";"Assignés";"Échéance";"Étiquettes"';
    const projection: ListTaskExport = {
      filename: 'sprint-14.csv',
      header,
      rows: [
        {
          beforeAssignees: ['"CAD-482"', '"Compte"', '"En cours"', '"Haute"'],
          assigneeIds: ['019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30'],
          afterAssignees: ['""', '""'],
        },
      ],
    };

    expect(ExportListTasksInternalResponse.parse(projection)).toEqual(projection);
    expect(ExportListTasksResponse.parse(header + '\r\n')).toBe(header + '\r\n');
    expect(ExportListTasksResponse.safeParse(projection).success).toBe(false);
  });

  it('bounds an internal lookup batch before any directory work', () => {
    const userId: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';
    expect(
      LookupMemberNamesInternalBody.safeParse({ userIds: Array(5000).fill(userId) }).success,
    ).toBe(true);
    expect(
      LookupMemberNamesInternalBody.safeParse({ userIds: Array(5001).fill(userId) }).success,
    ).toBe(false);
  });
});

describe('dashboard query weeks', () => {
  const query: { today: string; timeZone: string } = {
    today: '2026-11-20',
    timeZone: 'Europe/Paris',
  };

  it.each([GetTeamDashboardQueryParams, GetTeamDashboardInternalQueryParams])(
    'defaults to eight weeks and parses twelve weeks from the URL',
    (validator) => {
      expect(validator.parse(query).weeks).toBe(8);
      expect(validator.parse({ ...query, weeks: '12' }).weeks).toBe(12);
      expect(validator.safeParse({ ...query, weeks: '6' }).success).toBe(false);
    },
  );
});

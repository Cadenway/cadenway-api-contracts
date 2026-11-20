import { describe, expect, it } from 'vitest';

import type {
  CustomFieldDefinitionPage,
  SavedViewCreation,
} from '../../packages/contracts/src/generated/types/public/lists';
import {
  CreateSavedViewInternalBody,
  CreateSpaceCustomFieldInternalBody,
  GetTaskInternalResponse,
  ListListCustomFieldsInternalResponse,
  RetireSpaceCustomFieldInternalParams,
  UpdateSavedViewInternalBody,
  UpdateSpaceCustomFieldInternalBody,
  UpdateTaskInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  CreateSavedViewBody,
  ListListCustomFieldsResponse,
  UpdateSavedViewBody,
} from '../../packages/contracts/src/generated/validators/public/lists';
import {
  CreateSpaceCustomFieldBody,
  RetireSpaceCustomFieldParams,
  UpdateSpaceCustomFieldBody,
} from '../../packages/contracts/src/generated/validators/public/spaces';
import {
  GetTaskResponse,
  UpdateTaskBody,
} from '../../packages/contracts/src/generated/validators/public/tasks';

/**
 * Constant spaceId
 *
 * @description
 * The space containing the mockup's Points and Client definitions.
 *
 * @type {string}
 */
const spaceId: string = '019a7000-1a2b-7c3d-8e4f-5a6b7c8d9e01';

/**
 * Constant pointsId
 *
 * @description
 * The stable ID of the numeric Points field.
 *
 * @type {string}
 */
const pointsId: string = '019a700a-1234-7567-89ab-cdef01234567';

/**
 * Constant clientId
 *
 * @description
 * The stable ID of the text Client field.
 *
 * @type {string}
 */
const clientId: string = '019a700a-1234-7567-89ab-cdef01234568';

describe.each([
  {
    boundary: 'public',
    createDefinition: CreateSpaceCustomFieldBody,
    updateDefinition: UpdateSpaceCustomFieldBody,
    retirePath: RetireSpaceCustomFieldParams,
    listDefinitions: ListListCustomFieldsResponse,
    updateTask: UpdateTaskBody,
    readValues: GetTaskResponse.shape.customFieldValues,
    createSavedView: CreateSavedViewBody,
    updateSavedView: UpdateSavedViewBody,
  },
  {
    boundary: 'internal',
    createDefinition: CreateSpaceCustomFieldInternalBody,
    updateDefinition: UpdateSpaceCustomFieldInternalBody,
    retirePath: RetireSpaceCustomFieldInternalParams,
    listDefinitions: ListListCustomFieldsInternalResponse,
    updateTask: UpdateTaskInternalBody,
    readValues: GetTaskInternalResponse.shape.customFieldValues,
    createSavedView: CreateSavedViewInternalBody,
    updateSavedView: UpdateSavedViewInternalBody,
  },
])('$boundary custom fields', (validators) => {
  it('creates numeric or text definitions without a caller-controlled ID or designation', () => {
    expect(validators.createDefinition.parse({ name: 'Points', type: 'number' })).toEqual({
      name: 'Points',
      type: 'number',
    });
    expect(validators.createDefinition.safeParse({ name: 'Client', type: 'text' }).success).toBe(
      true,
    );
    expect(validators.createDefinition.safeParse({ name: '  ', type: 'text' }).success).toBe(false);
    expect(validators.createDefinition.safeParse({ name: 'Client', type: 'formula' }).success).toBe(
      false,
    );
    expect(
      validators.createDefinition.safeParse({ name: 'Points', type: 'number', id: pointsId })
        .success,
    ).toBe(false);
    expect(
      validators.createDefinition.safeParse({ name: 'Points', type: 'number', sprintPoints: true })
        .success,
    ).toBe(false);
  });

  it('allows renaming, ordering and designating a stable definition without changing its type', () => {
    expect(
      validators.updateDefinition.parse({ name: 'Effort', position: 0, sprintPoints: true }),
    ).toEqual({
      name: 'Effort',
      position: 0,
      sprintPoints: true,
    });
    expect(validators.updateDefinition.safeParse({ type: 'text' }).success).toBe(false);
    expect(validators.updateDefinition.safeParse({ position: -1 }).success).toBe(false);
    expect(validators.updateDefinition.safeParse({ position: 30 }).success).toBe(false);
    expect(validators.retirePath.safeParse({ spaceId, fieldId: pointsId }).success).toBe(true);
    expect(
      validators.retirePath.safeParse({ spaceId, fieldId: pointsId.replace('-7567-', '-4567-') })
        .success,
    ).toBe(false);
  });

  it('bounds display names by Unicode code points on both writes', () => {
    expect(
      validators.createDefinition.safeParse({ name: '💡'.repeat(80), type: 'text' }).success,
    ).toBe(true);
    expect(
      validators.createDefinition.safeParse({ name: '💡'.repeat(81), type: 'text' }).success,
    ).toBe(false);
    expect(validators.updateDefinition.safeParse({ name: '💡'.repeat(80) }).success).toBe(true);
    expect(validators.updateDefinition.safeParse({ name: '💡'.repeat(81) }).success).toBe(false);
  });

  it('reads ordered list metadata with stable IDs and an opaque cursor', () => {
    const page: CustomFieldDefinitionPage = {
      items: [
        {
          id: pointsId,
          spaceId,
          name: 'Points',
          type: 'number',
          position: 0,
          sprintPoints: true,
          version: 2,
        },
        {
          id: clientId,
          spaceId,
          name: 'Client',
          type: 'text',
          position: 1,
          sprintPoints: false,
          version: 1,
        },
      ],
      nextCursor: null,
    };
    expect(validators.listDefinitions.parse(page)).toEqual(page);
    expect(validators.listDefinitions.safeParse({ items: page.items }).success).toBe(false);
  });

  it('preserves existing task patches, zero, empty text and entry-level clears', () => {
    expect(validators.updateTask.parse({ status: 'progress' })).toEqual({ status: 'progress' });
    expect(
      validators.updateTask.parse({ customFieldValues: { [pointsId]: 0, [clientId]: null } }),
    ).toEqual({
      customFieldValues: { [pointsId]: 0, [clientId]: null },
    });
    expect(validators.updateTask.safeParse({ customFieldValues: { [clientId]: '' } }).success).toBe(
      true,
    );
    expect(validators.updateTask.safeParse({ customFieldValues: null }).success).toBe(false);
    expect(
      validators.updateTask.safeParse({ customFieldValues: { [pointsId]: true } }).success,
    ).toBe(false);
  });

  it('bounds the sparse patch by field IDs and Unicode code points', () => {
    const customFieldValues: Record<string, number> = Object.fromEntries(
      Array.from({ length: 31 }, (_, index) => [
        `019a700a-1234-7567-89ab-${String(index).padStart(12, '0')}`,
        index,
      ]),
    );
    expect(validators.updateTask.safeParse({ customFieldValues }).success).toBe(false);
    expect(validators.updateTask.safeParse({ customFieldValues: { Points: 0 } }).success).toBe(
      false,
    );
    expect(
      validators.updateTask.safeParse({
        customFieldValues: { [pointsId]: 0, [pointsId.toUpperCase()]: 1 },
      }).success,
    ).toBe(false);
    expect(
      validators.updateTask.safeParse({ customFieldValues: { [clientId]: 'é'.repeat(500) } })
        .success,
    ).toBe(true);
    expect(
      validators.updateTask.safeParse({ customFieldValues: { [clientId]: '💡'.repeat(500) } })
        .success,
    ).toBe(true);
    expect(
      validators.updateTask.safeParse({ customFieldValues: { [clientId]: '💡'.repeat(501) } })
        .success,
    ).toBe(false);
  });

  it('accepts legacy task responses and rejects stale null or non-ID entries in reported values', () => {
    expect(validators.readValues.parse(undefined)).toBeUndefined();
    expect(validators.readValues.parse({ [pointsId]: 0, [clientId]: '' })).toEqual({
      [pointsId]: 0,
      [clientId]: '',
    });
    expect(validators.readValues.safeParse({ [clientId]: null }).success).toBe(false);
    expect(validators.readValues.safeParse({ Client: 'Atelier Nord' }).success).toBe(false);
  });

  it('uses a stable custom field ID in saved sheet settings and retains legacy column keys', () => {
    const creation: SavedViewCreation = {
      name: 'Sprint 14',
      configuration: {
        layout: 'table',
        filters: {},
        sort: '-dueDate',
        groupBy: null,
        presentation: {
          hiddenSheetColumns: ['client'],
          hiddenCustomFieldIds: [clientId],
          sheetSort: { column: 'points', direction: 'asc' },
          customFieldSort: { fieldId: pointsId, direction: 'desc' },
        },
      },
    };
    expect(validators.createSavedView.parse(creation)).toEqual(creation);
    expect(
      validators.updateSavedView.safeParse({
        configuration: { presentation: { customFieldSort: { fieldId: clientId } } },
      }).success,
    ).toBe(true);
    expect(
      validators.updateSavedView.safeParse({
        configuration: { presentation: { hiddenCustomFieldIds: ['autre-colonne'] } },
      }).success,
    ).toBe(false);
  });
});

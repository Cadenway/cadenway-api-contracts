import { describe, expect, it } from 'vitest';

import type {
  IntakeFormPatch,
  IntakeSubmission,
} from '../../packages/contracts/src/generated/types/public/intake';
import {
  SubmitPublicIntakeFormInternalBody,
  UpdateIntakeFormConfigurationInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  SubmitPublicIntakeFormBody,
  UpdateIntakeFormConfigurationBody,
} from '../../packages/contracts/src/generated/validators/public/intake';

describe.each([
  {
    side: 'public',
    submission: SubmitPublicIntakeFormBody,
    patch: UpdateIntakeFormConfigurationBody,
  },
  {
    side: 'internal',
    submission: SubmitPublicIntakeFormInternalBody,
    patch: UpdateIntakeFormConfigurationInternalBody,
  },
])(
  '$side intake write validators',
  ({
    submission,
    patch,
  }: {
    submission: typeof SubmitPublicIntakeFormBody;
    patch: typeof UpdateIntakeFormConfigurationBody;
  }) => {
    it('accepts the public submission fields', () => {
      const request: IntakeSubmission = {
        title: 'Refondre l’écran de connexion',
        description: 'Clarifier les étapes de connexion.',
        priority: 'haute',
        dueDate: '2026-11-20',
        contactEmail: 'demandeur@example.test',
      };

      expect(submission.parse(request)).toEqual(request);
      expect(submission.parse({ title: request.title })).toEqual({ title: request.title });
    });

    it.each(['organizationId', 'listId', 'actorUserId', 'assigneeId', 'status', 'attachments'])(
      'rejects extra submission field %s',
      (field) => {
        expect(
          submission.safeParse({ title: 'Refondre l’écran de connexion', [field]: 'extra' })
            .success,
        ).toBe(false);
      },
    );

    it('accepts sparse changes and explicit clears in the editor patch', () => {
      const request: IntakeFormPatch = {
        description: null,
        defaultAssigneeId: null,
        fields: { contactEmail: 'required' },
      };

      expect(patch.parse(request)).toEqual(request);
    });

    it('rejects extra settings at both levels of the editor patch', () => {
      expect(patch.safeParse({ title: 'Déposer une demande', publicKey: 'extra' }).success).toBe(
        false,
      );
      expect(patch.safeParse({ version: 1 }).success).toBe(false);
      expect(
        patch.safeParse({ fields: { contactEmail: 'required', title: 'disabled' } }).success,
      ).toBe(false);
    });
  },
);

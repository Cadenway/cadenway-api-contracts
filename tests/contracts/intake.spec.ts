import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import type {
  IntakeFormPatch,
  IntakeSubmission,
} from '../../packages/contracts/src/generated/types/public/intake';
import {
  CompleteIntakeAttachmentUploadInternalResponse,
  StartIntakeAttachmentUploadInternalBody,
  StartIntakeAttachmentUploadInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/storage-service';
import {
  AllocateIntakeAttachmentInternalBody,
  AllocateIntakeAttachmentInternalResponse,
  ResolveIntakeAttachmentInternalResponse,
  SubmitPublicIntakeFormInternalBody,
  UpdateIntakeFormConfigurationInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  CompletePublicIntakeAttachmentUploadResponse,
  GetPublicIntakeFormResponse,
  StartPublicIntakeAttachmentUploadBody,
  StartPublicIntakeAttachmentUploadResponse,
  SubmitPublicIntakeFormBody,
  UpdateIntakeFormConfigurationBody,
} from '../../packages/contracts/src/generated/validators/public/intake';

/**
 * Constant ATTACHMENT_ID
 *
 * @description
 * A version 7 identifier shared by attachment contract examples.
 *
 * @type {string}
 */
const ATTACHMENT_ID: string = '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01';
/**
 * Constant DRAFT_EXPIRES_AT
 *
 * @description
 * Expiration of the fixture draft's thirty-minute lease.
 *
 * @type {string}
 */
const DRAFT_EXPIRES_AT: string = '2026-11-20T09:30:00Z';
/**
 * Constant MAX_ATTACHMENT_BYTES
 *
 * @description
 * Maximum declared length accepted at the Storage boundary.
 *
 * @type {number}
 */
const MAX_ATTACHMENT_BYTES: number = 25 * 1024 * 1024;

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

    it('accepts at most five distinct attachment IDs and keeps the caller order', () => {
      const attachmentIds: string[] = Array.from(
        { length: 5 },
        (_, index) => `${ATTACHMENT_ID.slice(0, -1)}${String(index)}`,
      ).reverse();
      const request: IntakeSubmission = { title: 'Refondre l’écran de connexion', attachmentIds };

      expect(submission.parse(request)).toEqual(request);
      expect(submission.safeParse({ ...request, attachmentIds: [] }).success).toBe(false);
      expect(
        submission.safeParse({
          ...request,
          attachmentIds: [...attachmentIds, `${ATTACHMENT_ID.slice(0, -1)}5`],
        }).success,
      ).toBe(false);
      expect(
        submission.safeParse({ ...request, attachmentIds: [ATTACHMENT_ID, ATTACHMENT_ID] }).success,
      ).toBe(false);
      expect(
        submission.safeParse({
          ...request,
          attachmentIds: [ATTACHMENT_ID, ATTACHMENT_ID.toUpperCase()],
        }).success,
      ).toBe(false);
      expect(
        submission.safeParse({
          ...request,
          attachmentIds: [ATTACHMENT_ID.replace('-7f6a', '-4f6a')],
        }).success,
      ).toBe(false);
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

    it.each(['disabled', 'optional', 'required'] as const)(
      'accepts the attachment mode %s',
      (mode) => {
        const request: IntakeFormPatch = { fields: { attachments: mode } };
        expect(patch.parse(request)).toEqual(request);
      },
    );

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

describe('intake attachment wire contracts', () => {
  it('accepts legacy form projections and preserves a configured attachment mode', () => {
    const legacy: z.input<typeof GetPublicIntakeFormResponse> = {
      title: 'Déposer une demande',
      description: null,
      fields: {
        description: 'optional',
        priority: 'optional',
        dueDate: 'disabled',
        contactEmail: 'required',
      },
    };

    expect(GetPublicIntakeFormResponse.parse(legacy)).toEqual(legacy);
    expect(
      GetPublicIntakeFormResponse.parse({
        ...legacy,
        fields: { ...legacy.fields, attachments: 'required' },
      }).fields.attachments,
    ).toBe('required');
  });

  it('preserves Unicode filenames and keeps the byte cap on the trusted Storage declaration', () => {
    const file: z.input<typeof StartPublicIntakeAttachmentUploadBody> = {
      fileName: '📎'.repeat(255),
      contentType: 'image/png',
      sizeBytes: MAX_ATTACHMENT_BYTES,
    };
    const trusted: z.input<typeof StartIntakeAttachmentUploadInternalBody> = {
      ...file,
      attachmentId: ATTACHMENT_ID,
      expiresAt: DRAFT_EXPIRES_AT,
    };

    expect(StartPublicIntakeAttachmentUploadBody.parse(file)).toEqual(file);
    expect(AllocateIntakeAttachmentInternalBody.parse(file)).toEqual(file);
    expect(StartIntakeAttachmentUploadInternalBody.parse(trusted)).toEqual(trusted);
    expect(
      StartIntakeAttachmentUploadInternalBody.safeParse({
        ...trusted,
        sizeBytes: MAX_ATTACHMENT_BYTES + 1,
      }).success,
    ).toBe(false);
    expect(StartPublicIntakeAttachmentUploadBody.safeParse(trusted).success).toBe(false);
    expect(AllocateIntakeAttachmentInternalBody.safeParse(trusted).success).toBe(false);
    expect(
      StartIntakeAttachmentUploadInternalBody.safeParse({ ...trusted, draftKey: 'leak' }).success,
    ).toBe(false);
  });

  it('requires a signed form field and keeps acknowledgements limited to an ID', () => {
    const upload: z.input<typeof StartPublicIntakeAttachmentUploadResponse> = {
      id: ATTACHMENT_ID,
      method: 'POST',
      url: 'https://uploads.example.test/',
      fields: { key: 'staged' },
      expiresAt: '2026-11-20T09:05:00Z',
    };
    const completion: { id: string } = { id: ATTACHMENT_ID };

    for (const schema of [
      StartPublicIntakeAttachmentUploadResponse,
      StartIntakeAttachmentUploadInternalResponse,
    ]) {
      expect(schema.parse(upload)).toEqual(upload);
      expect(schema.safeParse({ ...upload, fields: {} }).success).toBe(false);
    }
    for (const schema of [
      CompletePublicIntakeAttachmentUploadResponse,
      CompleteIntakeAttachmentUploadInternalResponse,
    ]) {
      expect(schema.parse(completion)).toEqual(completion);
      expect(schema.safeParse({ ...completion, fileName: 'capture-login.png' }).success).toBe(
        false,
      );
    }
  });

  it('returns only the tenant and reservation coordinates on internal Task routes', () => {
    const allocation: z.input<typeof AllocateIntakeAttachmentInternalResponse> = {
      organizationId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b03',
      publicationId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b02',
      attachmentId: ATTACHMENT_ID,
      expiresAt: DRAFT_EXPIRES_AT,
    };

    for (const schema of [
      AllocateIntakeAttachmentInternalResponse,
      ResolveIntakeAttachmentInternalResponse,
    ]) {
      expect(schema.parse(allocation)).toEqual(allocation);
      expect(schema.safeParse({ ...allocation, draftKey: 'leak' }).success).toBe(false);
    }
  });
});

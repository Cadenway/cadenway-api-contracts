import { describe, expect, it } from 'vitest';

import type {
  AttachmentUpload,
  StartAttachmentUpload,
} from '../../packages/contracts/src/generated/types/public/attachments';
import {
  StartTaskAttachmentUploadInternalBody,
  StartTaskAttachmentUploadInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/storage-service';
import { CheckTaskAttachmentAccessInternalQueryParams } from '../../packages/contracts/src/generated/validators/internal/task-service';
import {
  StartTaskAttachmentUploadBody,
  StartTaskAttachmentUploadResponse,
} from '../../packages/contracts/src/generated/validators/public/attachments';

describe.each([
  {
    surface: 'public',
    upload: StartTaskAttachmentUploadBody,
    transfer: StartTaskAttachmentUploadResponse,
  },
  {
    surface: 'internal',
    upload: StartTaskAttachmentUploadInternalBody,
    transfer: StartTaskAttachmentUploadInternalResponse,
  },
])(
  '$surface attachment upload validators',
  ({
    upload,
    transfer,
  }: {
    upload: typeof StartTaskAttachmentUploadBody;
    transfer: typeof StartTaskAttachmentUploadResponse;
  }) => {
    it('accepts the declared file and rejects an extra field', () => {
      const file: StartAttachmentUpload = {
        fileName: 'capture-login.png',
        contentType: 'image/png',
        sizeBytes: 184320,
      };

      expect(upload.parse(file)).toEqual(file);
      expect(upload.safeParse({ ...file, authorUserId: null }).success).toBe(false);
    });

    it('counts filename length in Unicode code points', () => {
      const file: StartAttachmentUpload = {
        fileName: '🖼'.repeat(251) + '.png',
        contentType: 'image/png',
        sizeBytes: 1,
      };

      expect(upload.parse(file)).toEqual(file);
      expect(upload.safeParse({ ...file, fileName: '🖼' + file.fileName }).success).toBe(false);
    });

    it('rejects padded dot segments, controls and malformed Unicode', () => {
      for (const fileName of [' . ', ' ..\t', 'preview\u0085.png', '\uD800.png']) {
        expect(upload.safeParse({ fileName, contentType: 'image/png', sizeBytes: 1 }).success).toBe(
          false,
        );
      }
    });

    it('rejects wildcard MIME declarations', () => {
      for (const contentType of ['image/*', '*/png', '*/*']) {
        expect(
          upload.safeParse({ fileName: 'preview.png', contentType, sizeBytes: 1 }).success,
        ).toBe(false);
      }
    });

    it('requires fields for the signed multipart upload', () => {
      const signedPost: AttachmentUpload = {
        id: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01',
        method: 'POST',
        url: 'https://files.example.test/uploads',
        fields: { key: 'pending/example', Policy: 'example' },
        expiresAt: '2026-11-20T15:05:00.000Z',
      };

      expect(transfer.parse(signedPost)).toEqual(signedPost);
      expect(transfer.safeParse({ ...signedPost, fields: {} }).success).toBe(false);
    });
  },
);

describe('internal attachment access mode', () => {
  it('accepts both explicit modes and rejects unknown parameters', () => {
    const validator: typeof CheckTaskAttachmentAccessInternalQueryParams =
      CheckTaskAttachmentAccessInternalQueryParams;

    expect(validator.parse({ mode: 'read' })).toEqual({ mode: 'read' });
    expect(validator.parse({ mode: 'write' })).toEqual({ mode: 'write' });
    expect(validator.safeParse({}).success).toBe(false);
    expect(validator.safeParse({ mode: 'wrong' }).success).toBe(false);
    expect(validator.safeParse({ mode: 'read', unknown: 'example' }).success).toBe(false);
  });
});

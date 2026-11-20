import { describe, expect, it } from 'vitest';

import {
  GetAvatarReferenceInternalResponse,
  SetAvatarInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  PrepareProfileMediaInternalBody,
  PrepareProfileMediaInternalResponse,
  SignProfileMediaTransferInternalBody,
  SignProfileMediaTransferInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/storage-service';
import {
  SetAvatarBody,
  SetOrganizationLogoBody,
  StartAvatarUploadBody,
  StartAvatarUploadResponse,
  StartOrganizationLogoUploadBody,
  StartOrganizationLogoUploadResponse,
} from '../../packages/contracts/src/generated/validators/public/profile-media';

describe('profile media declarations', () => {
  it('accepts avatar raster sources and the exact 5 MiB boundary', () => {
    for (const contentType of ['image/png', 'image/jpeg', 'image/webp']) {
      expect(StartAvatarUploadBody.safeParse({ contentType, sizeBytes: 5_242_880 }).success).toBe(
        true,
      );
    }
    expect(
      StartAvatarUploadBody.safeParse({ contentType: 'image/png', sizeBytes: 5_242_881 }).success,
    ).toBe(false);
    expect(
      StartAvatarUploadBody.safeParse({ contentType: 'image/svg+xml', sizeBytes: 1 }).success,
    ).toBe(false);
    expect(
      StartAvatarUploadBody.safeParse({ contentType: 'image/png', sizeBytes: 1, assetId: 'other' })
        .success,
    ).toBe(false);
  });

  it('admits static SVG or PNG sources only on the logo route', () => {
    for (const contentType of ['image/png', 'image/svg+xml']) {
      expect(StartOrganizationLogoUploadBody.safeParse({ contentType, sizeBytes: 1 }).success).toBe(
        true,
      );
    }
    expect(
      StartOrganizationLogoUploadBody.safeParse({ contentType: 'image/jpeg', sizeBytes: 1 })
        .success,
    ).toBe(false);
    expect(
      StartOrganizationLogoUploadBody.safeParse({ contentType: 'image/png', sizeBytes: 0 }).success,
    ).toBe(false);
  });

  it('validates the owner receipt without accepting caller-provided ownership', () => {
    const uploadId: string = '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01';
    for (const validator of [SetAvatarBody, SetOrganizationLogoBody, SetAvatarInternalBody]) {
      expect(validator.parse({ uploadId })).toEqual({ uploadId });
      expect(validator.safeParse({ uploadId, organizationId: uploadId }).success).toBe(false);
      expect(
        validator.safeParse({ uploadId: '019a7003-4d5e-4f6a-8b9c-0d1e2f3a4b01' }).success,
      ).toBe(false);
    }
    expect(GetAvatarReferenceInternalResponse.parse({ assetId: null })).toEqual({ assetId: null });
    expect(GetAvatarReferenceInternalResponse.parse({ assetId: uploadId })).toEqual({
      assetId: uploadId,
    });
  });
});

describe('profile media Storage wire contract', () => {
  it('constrains a reservation transfer to the media kind and rejects extra fields', () => {
    const expiresAt: string = '2026-11-20T15:05:00.000Z';
    const file: { contentType: string; sizeBytes: number } = {
      contentType: 'image/svg+xml',
      sizeBytes: 1,
    };
    const logo: typeof file & { kind: 'organization-logo'; expiresAt: string } = {
      kind: 'organization-logo',
      expiresAt,
      ...file,
    };

    expect(SignProfileMediaTransferInternalBody.parse(logo)).toEqual(logo);
    expect(
      SignProfileMediaTransferInternalBody.safeParse({ ...logo, kind: 'avatar' }).success,
    ).toBe(false);
    expect(
      SignProfileMediaTransferInternalBody.safeParse({ ...logo, readUrl: 'last' }).success,
    ).toBe(false);
    expect(PrepareProfileMediaInternalBody.safeParse({ kind: 'organization-logo' }).success).toBe(
      true,
    );
    expect(
      PrepareProfileMediaInternalBody.safeParse({ kind: 'avatar', contentType: 'image/webp' })
        .success,
    ).toBe(false);
  });

  it('requires signed multipart fields on every transfer response', () => {
    const transfer: {
      uploadId: string;
      method: 'POST';
      url: string;
      fields: Record<string, string>;
      expiresAt: string;
    } = {
      uploadId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01',
      method: 'POST',
      url: 'https://files.example.test/uploads',
      fields: { key: 'pending/example', Policy: 'example' },
      expiresAt: '2026-11-20T15:05:00.000Z',
    };
    for (const validator of [
      StartAvatarUploadResponse,
      StartOrganizationLogoUploadResponse,
      SignProfileMediaTransferInternalResponse,
    ]) {
      expect(validator.parse(transfer)).toEqual(transfer);
      expect(validator.safeParse({ ...transfer, fields: {} }).success).toBe(false);
    }
  });

  it('publishes only bounded PNG preparation metadata', () => {
    const image: {
      uploadId: string;
      contentType: 'image/png';
      width: number;
      height: number;
      sizeBytes: number;
    } = {
      uploadId: '019a7003-4d5e-7f6a-8b9c-0d1e2f3a4b01',
      contentType: 'image/png',
      width: 512,
      height: 512,
      sizeBytes: 1000,
    };
    expect(PrepareProfileMediaInternalResponse.parse(image)).toEqual(image);
    expect(PrepareProfileMediaInternalResponse.safeParse({ ...image, width: 513 }).success).toBe(
      false,
    );
    expect(
      PrepareProfileMediaInternalResponse.safeParse({ ...image, contentType: 'image/svg+xml' })
        .success,
    ).toBe(false);
  });
});

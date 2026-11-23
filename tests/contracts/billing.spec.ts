import { describe, expect, it } from 'vitest';

import {
  GetBillingActiveSeatCountInternalResponse,
  ListBillingMembershipsInternalQueryParams,
  ListBillingOrganizationsInternalQueryParams,
  ListQuotaNotificationRecipientsInternalQueryParams,
  LookupQuotaNotificationRecipientsInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/organization-service';
import { ListBillingAttachmentUsageInternalQueryParams } from '../../packages/contracts/src/generated/validators/internal/storage-service';

describe('Billing snapshot and notification recipient pagination', () => {
  it('accepts only a nonnegative integer seat count', () => {
    const seats: typeof GetBillingActiveSeatCountInternalResponse =
      GetBillingActiveSeatCountInternalResponse;
    expect(seats.safeParse({ activeSeatCount: 0 }).success).toBe(true);
    expect(seats.safeParse({ activeSeatCount: 4 }).success).toBe(true);
    expect(seats.safeParse({ activeSeatCount: -1 }).success).toBe(false);
    expect(seats.safeParse({ activeSeatCount: 1.5 }).success).toBe(false);
    expect(seats.safeParse({ activeSeatCount: 1, memberIds: [] }).success).toBe(false);
  });

  it.each([
    ['organization roster', ListBillingOrganizationsInternalQueryParams],
    ['membership snapshot', ListBillingMembershipsInternalQueryParams],
    ['attachment snapshot', ListBillingAttachmentUsageInternalQueryParams],
    ['quota notification recipients', ListQuotaNotificationRecipientsInternalQueryParams],
  ])('bounds the opaque cursor on the %s', (_route, query) => {
    expect(query.safeParse({}).success).toBe(true);
    expect(query.safeParse({ cursor: 'a' }).success).toBe(true);
    expect(query.safeParse({ cursor: 'a'.repeat(1024) }).success).toBe(true);
    expect(query.safeParse({ cursor: '' }).success).toBe(false);
    expect(query.safeParse({ cursor: 'a'.repeat(1025) }).success).toBe(false);
  });

  it('bounds a quota recipient lookup to one hundred user IDs', () => {
    const userIds: string[] = Array.from(
      { length: 101 },
      (_, index) => `019a5f3c-8d2e-7c4a-9b1f-${String(index).padStart(12, '0')}`,
    );
    const lookup: typeof LookupQuotaNotificationRecipientsInternalBody =
      LookupQuotaNotificationRecipientsInternalBody;

    expect(lookup.safeParse({ userIds: [] }).success).toBe(false);
    expect(lookup.safeParse({ userIds: userIds.slice(0, 1) }).success).toBe(true);
    expect(lookup.safeParse({ userIds: userIds.slice(0, 100) }).success).toBe(true);
    expect(lookup.safeParse({ userIds }).success).toBe(false);
    expect(lookup.safeParse({ userIds: ['not-a-user-id'] }).success).toBe(false);
  });
});

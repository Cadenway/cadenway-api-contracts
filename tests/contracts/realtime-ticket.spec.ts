import { describe, expect, it } from 'vitest';

import {
  IssueRealtimeTicketInternalBody,
  RedeemRealtimeTicketInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import { IssueRealtimeTicketBody } from '../../packages/contracts/src/generated/validators/public/realtime';

describe('realtime ticket request validators', () => {
  it('accepts only an empty public body', () => {
    expect(IssueRealtimeTicketBody.safeParse({}).success).toBe(true);
    expect(IssueRealtimeTicketBody.safeParse({ sessionId: 'unused' }).success).toBe(false);
  });

  it('accepts only the session id and the credential on their respective internal routes', () => {
    const issue: { sessionId: string } = { sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60' };
    const redeem: { token: string } = { token: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFA' };
    expect(IssueRealtimeTicketInternalBody.safeParse(issue).success).toBe(true);
    expect(IssueRealtimeTicketInternalBody.safeParse({ ...issue, ...redeem }).success).toBe(false);
    expect(RedeemRealtimeTicketInternalBody.safeParse(redeem).success).toBe(true);
    expect(RedeemRealtimeTicketInternalBody.safeParse({ ...redeem, ...issue }).success).toBe(false);
  });
});

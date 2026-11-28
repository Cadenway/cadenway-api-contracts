import { describe, expect, it } from 'vitest';

import {
  USER_STATUS_MESSAGE_CHANGED_V1,
  eventSchemas,
  userStatusMessageChangedV1Schema,
  type UserStatusMessageChangedV1,
} from '../../packages/contracts/src/generated/events/identity-service';
import {
  GetStatusMessageInternalResponse,
  SetStatusMessageInternalBody,
  SetStatusMessageInternalResponse,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  GetStatusMessageResponse,
  SetStatusMessageBody,
  SetStatusMessageResponse,
} from '../../packages/contracts/src/generated/validators/public/auth';

// Pins what identity-service, the gateway and the web application rely on for the status message:
// one line of at most 80 characters that is not blank, a closed request body, and a pictogram set
// that may grow in responses and events.

/**
 * Constant USER_ID
 *
 * @description
 * UUID v7 standing for the account of Camille Martin, the signed-in user of the mockup data.
 *
 * @type {string}
 */
const USER_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

/**
 * Constant IN_A_MEETING
 *
 * @description
 * The "En réunion" suggestion of the mockup, cleared one hour later.
 *
 * @type {{ icon: string; text: string; clearsAt: string | null }}
 */
const IN_A_MEETING: { icon: string; text: string; clearsAt: string | null } = {
  icon: 'users',
  text: 'En réunion',
  clearsAt: '2026-11-24T10:00:00Z',
};

/**
 * Constant BODIES
 *
 * @description
 * The public and internal validators of the request body, which share one schema.
 *
 * @type {readonly (typeof SetStatusMessageBody)[]}
 */
const BODIES: readonly (typeof SetStatusMessageBody)[] = [
  SetStatusMessageBody,
  SetStatusMessageInternalBody,
];

/**
 * Constant RESPONSES
 *
 * @description
 * The public and internal validators of the read and save responses, which share one schema.
 *
 * @type {readonly (typeof GetStatusMessageResponse)[]}
 */
const RESPONSES: readonly (typeof GetStatusMessageResponse)[] = [
  GetStatusMessageResponse,
  SetStatusMessageResponse,
  GetStatusMessageInternalResponse,
  SetStatusMessageInternalResponse,
];

describe('status message routes', () => {
  it('accepts the suggestions of the mockup with each "Effacer après" choice', () => {
    for (const body of BODIES) {
      expect(body.safeParse(IN_A_MEETING).success).toBe(true);
      expect(
        body.safeParse({ icon: 'headphones', text: 'Concentration', clearsAt: null }).success,
      ).toBe(true);
      expect(body.safeParse({ ...IN_A_MEETING, text: '  En réunion  ' }).success).toBe(true);
      expect(body.safeParse({ ...IN_A_MEETING, text: 'x'.repeat(80) }).success).toBe(true);
    }
  });

  it('refuses a blank text, a text over 80 characters and a text of several lines', () => {
    for (const body of BODIES) {
      for (const text of [
        '',
        '   ',
        ' 　',
        'x'.repeat(81),
        'En\nréunion',
        'En\tréunion',
        'En\u0085réunion',
        'En réunion',
        'En réunion ',
      ]) {
        expect(body.safeParse({ ...IN_A_MEETING, text }).success, JSON.stringify(text)).toBe(false);
      }
    }
  });

  it('closes the body and its pictograms, and requires every member', () => {
    for (const body of BODIES) {
      expect(body.safeParse({ ...IN_A_MEETING, icon: 'rocket' }).success).toBe(false);
      expect(body.safeParse({ ...IN_A_MEETING, version: 2 }).success).toBe(false);
      expect(body.safeParse({ icon: 'users', text: 'En réunion' }).success).toBe(false);
    }
  });

  it('answers no message as null and reads a pictogram added by a later version', () => {
    for (const response of RESPONSES) {
      expect(response.parse({ statusMessage: null })).toEqual({ statusMessage: null });
      expect(response.safeParse({ statusMessage: IN_A_MEETING }).success).toBe(true);
      expect(
        response.safeParse({ statusMessage: { ...IN_A_MEETING, icon: 'rocket' } }).success,
      ).toBe(true);
      expect(response.safeParse({}).success).toBe(false);
    }
  });
});

describe('user.status-message-changed.v1', () => {
  it('carries the message after a set, and null after a clear', () => {
    const set: UserStatusMessageChangedV1 = {
      id: '019a7a10-3b4c-7d5e-8f6a-1b2c3d4e5f60',
      occurredAt: '2026-11-24T09:00:00Z',
      organizationId: null,
      actor: { type: 'user', id: USER_ID },
      version: 4,
      userId: USER_ID,
      statusMessage: IN_A_MEETING,
    };
    expect(eventSchemas[USER_STATUS_MESSAGE_CHANGED_V1]).toBe(userStatusMessageChangedV1Schema);
    expect(userStatusMessageChangedV1Schema.safeParse(set).success).toBe(true);
    expect(
      userStatusMessageChangedV1Schema.safeParse({ ...set, version: 5, statusMessage: null })
        .success,
    ).toBe(true);
    expect(
      userStatusMessageChangedV1Schema.safeParse({ ...set, organizationId: USER_ID }).success,
    ).toBe(false);
    expect(
      userStatusMessageChangedV1Schema.safeParse({
        ...set,
        statusMessage: { ...IN_A_MEETING, text: 'En\nréunion' },
      }).success,
    ).toBe(false);
  });

  it('keeps an event readable when a later version adds a member or a pictogram', () => {
    const later: Record<string, unknown> = {
      id: '019a7a10-3b4c-7d5e-8f6a-1b2c3d4e5f60',
      occurredAt: '2026-11-24T09:00:00Z',
      organizationId: null,
      actor: { type: 'user', id: USER_ID },
      version: 4,
      userId: USER_ID,
      statusMessage: { ...IN_A_MEETING, icon: 'rocket', emoji: true },
      reason: 'later',
    };
    expect(userStatusMessageChangedV1Schema.safeParse(later).success).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import {
  EVENT_NAMES,
  ONE_TIME_CODE_ISSUED_V1,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type OneTimeCodeIssuedV1,
  type UserSignedUpV1,
} from '../../packages/contracts/src/generated/events/identity-service';
import {
  GetUserResponse,
  IntrospectTokenResponse,
  SignInWithCodeInternalBody,
  SignInWithPasswordInternalBody,
  VerifySignUpInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  SignInWithCodeBody,
  SignUpBody,
  VerifySignUpBody,
} from '../../packages/contracts/src/generated/validators/public/auth';

// Pins what the consumers of the identity contracts rely on: which event is restricted (a change
// here moves a single-use code to or from the stream every backend reads), and the members the
// validators leave to identity-service so that it can answer its own error codes.

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
 * Constant codeIssued
 *
 * @description
 * Payload of `one-time-code.issued.v1` for the sign-in code of the mockup email.
 *
 * @type {OneTimeCodeIssuedV1}
 */
const codeIssued: OneTimeCodeIssuedV1 = {
  id: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a61',
  occurredAt: '2026-11-08T13:07:00Z',
  organizationId: null,
  actor: { type: 'system', id: 'identity-service' },
  version: 1,
  codeId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a62',
  userId: USER_ID,
  purpose: 'sign-in',
  code: '482913',
  expiresAt: '2026-11-08T13:17:00Z',
  recipient: { email: 'camille.martin@ateliernord.fr', name: 'Camille Martin' },
  language: 'fr',
};

/**
 * Constant signedUp
 *
 * @description
 * Payload of `user.signed-up.v1` for the sign-up of the mockup, outside any organization.
 *
 * @type {UserSignedUpV1}
 */
const signedUp: UserSignedUpV1 = {
  id: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a63',
  occurredAt: '2026-11-08T13:07:00Z',
  organizationId: null,
  actor: { type: 'user', id: USER_ID },
  version: 1,
  userId: USER_ID,
  email: 'camille.martin@ateliernord.fr',
  name: 'Camille Martin',
  language: 'fr',
};

describe('events of identity-service', () => {
  it('restricts the event that carries a code, and no other', () => {
    expect(RESTRICTED_EVENT_NAMES).toEqual([ONE_TIME_CODE_ISSUED_V1]);
    expect(EVENT_NAMES).toEqual([
      'one-time-code.issued.v1',
      'session.revoked.v1',
      'user.email-verified.v1',
      'user.profile-updated.v1',
      'user.signed-up.v1',
    ]);
  });

  it('validates a code to email and refuses what the email could not use', () => {
    const schema: (typeof eventSchemas)['one-time-code.issued.v1'] =
      eventSchemas['one-time-code.issued.v1'];

    expect(schema.parse(codeIssued)).toEqual(codeIssued);
    expect(schema.safeParse({ ...codeIssued, code: '482 913' }).success).toBe(false);
    expect(schema.safeParse({ ...codeIssued, purpose: 'password-reset' }).success).toBe(false);
  });

  it('accepts an account outside any organization', () => {
    expect(eventSchemas['user.signed-up.v1'].parse(signedUp)).toEqual(signedUp);
  });
});

describe('routes of authentication', () => {
  it('leaves the password policy to identity-service, which answers its own codes', () => {
    expect(
      SignUpBody.safeParse({
        name: 'Camille Martin',
        email: 'camille.martin@ateliernord.fr',
        password: 'court',
        acceptTerms: false,
      }).success,
    ).toBe(true);
  });

  it('takes a code as six digits and does not keep the session by default', () => {
    expect(
      VerifySignUpBody.parse({ email: 'camille.martin@ateliernord.fr', code: '482913' }),
    ).toEqual({ email: 'camille.martin@ateliernord.fr', code: '482913', rememberMe: false });
    expect(
      VerifySignUpBody.safeParse({ email: 'camille.martin@ateliernord.fr', code: '482 913' })
        .success,
    ).toBe(false);
  });

  it('keeps the password of a sign-up verification so that the gateway can forward it', () => {
    const verification: { email: string; code: string; password: string } = {
      email: 'camille.martin@ateliernord.fr',
      code: '482913',
      password: 'atelier-nord-sprint-14',
    };
    const client: { ipAddress: string; userAgent: null } = {
      ipAddress: '86.247.12.30',
      userAgent: null,
    };

    expect(VerifySignUpBody.parse(verification)).toEqual({ ...verification, rememberMe: false });
    expect(VerifySignUpInternalBody.parse({ ...verification, client })).toEqual({
      ...verification,
      rememberMe: false,
      client,
    });
    expect(
      VerifySignUpInternalBody.parse({
        email: verification.email,
        code: verification.code,
        client,
      }),
    ).not.toHaveProperty('password');
  });

  it('leaves the password out of the sign-in code verification', () => {
    expect(
      SignInWithCodeBody.parse({
        email: 'camille.martin@ateliernord.fr',
        code: '482913',
        password: 'atelier-nord-sprint-14',
      }),
    ).not.toHaveProperty('password');
    expect(
      SignInWithCodeInternalBody.parse({
        email: 'camille.martin@ateliernord.fr',
        code: '482913',
        password: 'atelier-nord-sprint-14',
        client: { ipAddress: '86.247.12.30', userAgent: null },
      }),
    ).not.toHaveProperty('password');
  });

  it('needs the client of the browser for every internal sign-in', () => {
    expect(
      SignInWithPasswordInternalBody.safeParse({
        email: 'camille.martin@ateliernord.fr',
        password: 'atelier-nord-sprint-14',
      }).success,
    ).toBe(false);
  });

  it('reads an account without the profile members, so that the gateway may move first', () => {
    const account: Record<string, unknown> = {
      id: USER_ID,
      name: 'Camille Martin',
      email: 'camille.martin@ateliernord.fr',
      language: 'fr',
      version: 2,
    };

    expect(GetUserResponse.parse(account)).toEqual(account);
    expect(
      GetUserResponse.parse({
        ...account,
        displayName: 'camille',
        jobTitle: 'Responsable produit',
        timeZone: 'Europe/Paris',
      }),
    ).toMatchObject({ displayName: 'camille', timeZone: 'Europe/Paris' });
  });

  it('introspects to an active session without organization, or to inactive only', () => {
    expect(
      IntrospectTokenResponse.parse({
        active: true,
        tokenType: 'session',
        sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60',
        userId: USER_ID,
        organizationId: null,
        role: null,
        scopes: [],
        expiresAt: '2026-12-08T13:07:00Z',
      }),
    ).toMatchObject({ active: true, organizationId: null });
    expect(IntrospectTokenResponse.parse({ active: false })).toEqual({ active: false });
    expect(IntrospectTokenResponse.safeParse({ active: true }).success).toBe(false);
  });
});

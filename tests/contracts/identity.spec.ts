import { describe, expect, it } from 'vitest';

import {
  EVENT_NAMES,
  ONE_TIME_CODE_ISSUED_V1,
  PASSWORD_RESET_LINK_ISSUED_V1,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type OneTimeCodeIssuedV1,
  type PasswordResetLinkIssuedV1,
  type UserPasswordChangedV1,
  type UserSignedUpV1,
} from '../../packages/contracts/src/generated/events/identity-service';
import {
  ChangePasswordInternalBody,
  CreateApiTokenInternalBody,
  GetUserResponse,
  IntrospectTokenResponse,
  ListUserSessionsInternalQueryParams,
  SignInWithCodeInternalBody,
  SignInWithPasswordInternalBody,
  VerifySignUpInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  ChangePasswordBody,
  ConfirmPasswordResetBody,
  SignInWithCodeBody,
  SignInWithPasswordResponse,
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

/**
 * Constant FIREFOX_ON_WINDOWS
 *
 * @description
 * Browser of the mockup security emails, as identity-service reads it from its User-Agent: the
 * version of Windows is not told reliably, so it is `null`.
 *
 * @type {UserPasswordChangedV1['client']}
 */
const FIREFOX_ON_WINDOWS: UserPasswordChangedV1['client'] = {
  device: {
    type: 'desktop',
    browser: 'Firefox',
    browserVersion: '132',
    os: 'Windows',
    osVersion: null,
  },
  ipAddress: '192.0.2.14',
};

/**
 * Constant resetLinkIssued
 *
 * @description
 * Payload of `password-reset-link.issued.v1` for the reset email of the mockup.
 *
 * @type {PasswordResetLinkIssuedV1}
 */
const resetLinkIssued: PasswordResetLinkIssuedV1 = {
  id: '019a6b44-0a1b-7c2d-8e3f-4a5b6c7d8e06',
  occurredAt: '2026-11-09T13:10:00Z',
  organizationId: null,
  actor: { type: 'system', id: 'identity-service' },
  version: 1,
  linkId: '019a6b44-0a1b-7c2d-8e3f-4a5b6c7d8e07',
  userId: USER_ID,
  token: 'ExampleOnlyResetToken0000000000000000000000',
  expiresAt: '2026-11-09T13:40:00Z',
  client: FIREFOX_ON_WINDOWS,
  recipient: { email: 'camille.martin@ateliernord.fr', name: 'Camille Martin' },
  language: 'fr',
  timeZone: 'Europe/Paris',
};

/**
 * Constant passwordChanged
 *
 * @description
 * Payload of `user.password-changed.v1` for a reset that closed the three other sessions of the
 * mockup.
 *
 * @type {UserPasswordChangedV1}
 */
const passwordChanged: UserPasswordChangedV1 = {
  id: '019a6b44-0a1b-7c2d-8e3f-4a5b6c7d8e01',
  occurredAt: '2026-11-09T13:16:00Z',
  organizationId: null,
  actor: { type: 'user', id: USER_ID },
  version: 4,
  userId: USER_ID,
  method: 'reset',
  closedSessionCount: 3,
  client: FIREFOX_ON_WINDOWS,
  recipient: { email: 'camille.martin@ateliernord.fr', name: 'Camille Martin' },
  language: 'fr',
  timeZone: 'Europe/Paris',
};

describe('events of identity-service', () => {
  it('restricts the events that carry a code or a link, and no other', () => {
    expect(RESTRICTED_EVENT_NAMES).toEqual([
      ONE_TIME_CODE_ISSUED_V1,
      PASSWORD_RESET_LINK_ISSUED_V1,
    ]);
    expect(EVENT_NAMES).toEqual([
      'one-time-code.issued.v1',
      'password-reset-link.issued.v1',
      'session.opened-on-new-device.v1',
      'session.revoked.v1',
      'user.deleted.v1',
      'user.deletion-cancelled.v1',
      'user.deletion-scheduled.v1',
      'user.email-changed.v1',
      'user.email-verified.v1',
      'user.password-changed.v1',
      'user.profile-updated.v1',
      'user.signed-up.v1',
    ]);
  });

  it('validates a reset link and refuses a token that cannot sit in the fragment of a link', () => {
    const schema: (typeof eventSchemas)['password-reset-link.issued.v1'] =
      eventSchemas['password-reset-link.issued.v1'];

    expect(schema.parse(resetLinkIssued)).toEqual(resetLinkIssued);
    expect(schema.safeParse({ ...resetLinkIssued, token: 'a/b#c?d=e&f+g' }).success).toBe(false);
    expect(schema.safeParse({ ...resetLinkIssued, token: 'short' }).success).toBe(false);
  });

  it('tells the password email how many sessions closed, and refuses an unknown way', () => {
    const schema: (typeof eventSchemas)['user.password-changed.v1'] =
      eventSchemas['user.password-changed.v1'];

    expect(schema.parse(passwordChanged)).toEqual(passwordChanged);
    expect(schema.safeParse({ ...passwordChanged, method: 'admin' }).success).toBe(false);
    expect(schema.safeParse({ ...passwordChanged, closedSessionCount: -1 }).success).toBe(false);
  });

  it('keeps the secret of a reset out of the password change notice', () => {
    expect(
      eventSchemas['user.password-changed.v1'].parse({
        ...passwordChanged,
        token: resetLinkIssued.token,
      }),
    ).not.toHaveProperty('token');
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

describe('routes of account security', () => {
  it('carries the session of a token creation so that identity-service checks its recent authentication', () => {
    const creation: { name: string; scopes: ['tasks:read'] } = {
      name: 'Synchronisation GitLab',
      scopes: ['tasks:read'],
    };

    expect(
      CreateApiTokenInternalBody.parse({
        ...creation,
        sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60',
      }),
    ).toMatchObject({ sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60' });
    expect(CreateApiTokenInternalBody.safeParse(creation).success).toBe(true);
    expect(
      CreateApiTokenInternalBody.safeParse({ ...creation, sessionId: 'current' }).success,
    ).toBe(false);
  });

  it('closes the other sessions of a reset unless the person unticks it', () => {
    const confirmation: { token: string; newPassword: string } = {
      token: resetLinkIssued.token,
      newPassword: 'nord-atelier-sprint-15',
    };

    expect(ConfirmPasswordResetBody.parse(confirmation)).toEqual({
      ...confirmation,
      closeOtherSessions: true,
    });
    expect(
      ConfirmPasswordResetBody.parse({ ...confirmation, closeOtherSessions: false }),
    ).toMatchObject({ closeOtherSessions: false });
  });

  it('leaves the rules of a new password to identity-service, which answers its own codes', () => {
    expect(
      ChangePasswordBody.safeParse({
        currentPassword: 'atelier-nord-sprint-14',
        newPassword: 'court',
      }).success,
    ).toBe(true);
  });

  it('names the session of the request on the internal routes of the account', () => {
    const change: Record<string, unknown> = {
      currentPassword: 'atelier-nord-sprint-14',
      newPassword: 'nord-atelier-sprint-15',
      client: { ipAddress: '192.0.2.14', userAgent: null },
    };

    expect(ChangePasswordInternalBody.safeParse(change).success).toBe(false);
    expect(
      ChangePasswordInternalBody.safeParse({
        ...change,
        sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60',
      }).success,
    ).toBe(true);
    expect(ListUserSessionsInternalQueryParams.safeParse({ limit: '20' }).success).toBe(false);
    expect(
      ListUserSessionsInternalQueryParams.parse({
        currentSessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60',
        limit: '20',
      }),
    ).toMatchObject({ limit: 20 });
  });

  it('reads a sign-in without the cancellation of a deletion, so that the gateway may move first', () => {
    const signedIn: Record<string, unknown> = {
      user: {
        id: USER_ID,
        name: 'Camille Martin',
        email: 'camille.martin@ateliernord.fr',
        language: 'fr',
        displayName: null,
        jobTitle: null,
        timeZone: 'Europe/Paris',
        version: 2,
      },
      session: { id: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60', expiresAt: '2026-12-08T13:07:00Z' },
    };

    expect(SignInWithPasswordResponse.parse(signedIn)).toEqual(signedIn);
    expect(
      SignInWithPasswordResponse.parse({ ...signedIn, deletionCancelled: true }),
    ).toMatchObject({ deletionCancelled: true });
  });
});

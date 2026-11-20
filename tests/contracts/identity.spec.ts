import { describe, expect, it } from 'vitest';

import {
  EVENT_NAMES,
  ONE_TIME_CODE_ISSUED_V1,
  PASSWORD_RESET_LINK_ISSUED_V1,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type OneTimeCodeIssuedV1,
  type PasswordResetLinkIssuedV1,
  type UserAvatarChangedV1,
  type UserAvatarUploadAbandonedV1,
  type UserPasswordChangedV1,
  type UserSignedUpV1,
  type UserTwoStepVerificationChangedV1,
} from '../../packages/contracts/src/generated/events/identity-service';
import {
  AnswerSignInChallengeWithAuthenticatorAppInternalResponse,
  ChangePasswordInternalBody,
  CreateApiTokenInternalBody,
  GetUserResponse,
  InspectSignInChallengeInternalResponse,
  IntrospectApiTokenResponse,
  IntrospectTokenResponse,
  ListUserSessionsInternalQueryParams,
  ReauthenticateInternalBody,
  SignInWithCodeInternalBody,
  SignInWithPasswordInternalBody,
  StartSecurityKeyRegistrationInternalResponse,
  VerifySignUpInternalBody,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  AnswerSignInChallengeWithAuthenticatorAppBody,
  AnswerSignInChallengeWithBackupCodeBody,
  AnswerSignInChallengeWithSecurityKeyBody,
  ChangePasswordBody,
  ConfirmAuthenticatorAppSetupResponse,
  ConfirmPasswordResetBody,
  ReauthenticateBody,
  SignInWithCodeBody,
  SignInWithPasswordResponse,
  SignUpBody,
  VerifySignUpBody,
} from '../../packages/contracts/src/generated/validators/public/auth';
import { UpdateAuthenticationPolicyBody } from '../../packages/contracts/src/generated/validators/public/organizations';

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

/**
 * Constant twoStepEnabled
 *
 * @description
 * Payload of `user.two-step-verification-changed.v1` when Camille Martin turns two-step
 * verification on, as the mockup email "La vérification en deux étapes est activée" shows it.
 *
 * @type {UserTwoStepVerificationChangedV1}
 */
const twoStepEnabled: UserTwoStepVerificationChangedV1 = {
  id: '019a6b44-0a1b-7c2d-8e3f-4a5b6c7d8e08',
  occurredAt: '2026-11-09T13:21:00Z',
  organizationId: null,
  actor: { type: 'user', id: USER_ID },
  version: 8,
  userId: USER_ID,
  change: 'enabled',
  enabled: true,
  methods: ['authenticator-app'],
  backupCodesRemaining: 10,
  securityKey: null,
  client: FIREFOX_ON_WINDOWS,
  recipient: { email: 'camille.martin@ateliernord.fr', name: 'Camille Martin' },
  language: 'fr',
  timeZone: 'Europe/Paris',
};

/**
 * Constant CHALLENGE_TOKEN
 *
 * @description
 * Example token of a two-step challenge, of the length identity-service issues (256 bits in
 * base64url). Not a real secret.
 *
 * @type {string}
 */
const CHALLENGE_TOKEN: string = 'ExampleOnlyChallengeToken00000000000000000';

/**
 * Constant signInChallenge
 *
 * @description
 * The two-step challenge of the sign-in of Camille Martin, with her app, her two keys and 7
 * backup codes left, as the screen "Vérification en deux étapes" of the mockup shows it.
 *
 * @type {Record<string, unknown>}
 */
const signInChallenge: Record<string, unknown> = {
  token: CHALLENGE_TOKEN,
  expiresAt: '2026-11-09T07:52:00Z',
  email: 'camille.martin@ateliernord.fr',
  name: 'Camille Martin',
  primaryMethod: 'authenticator-app',
  methods: ['authenticator-app', 'security-key', 'backup-code'],
  securityKeys: [{ name: 'YubiKey 5C NFC' }, { name: 'Touch ID (MacBook Air)' }],
  backupCodesRemaining: 7,
  lockedUntil: null,
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
      'user.avatar-changed.v1',
      'user.avatar-upload-abandoned.v1',
      'user.deleted.v1',
      'user.deletion-cancelled.v1',
      'user.deletion-scheduled.v1',
      'user.email-changed.v1',
      'user.email-verified.v1',
      'user.password-changed.v1',
      'user.profile-updated.v1',
      'user.signed-up.v1',
      'user.two-step-verification-changed.v1',
    ]);
  });

  it('keeps avatar changes and terminal reservations scoped to the account', () => {
    const changed: UserAvatarChangedV1 = {
      id: '019a7006-2c3d-7e4f-8a5b-6c7d8e9f0a12',
      occurredAt: '2026-11-20T09:10:00Z',
      organizationId: null,
      actor: { type: 'user', id: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30' },
      userId: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30',
      version: 3,
      assetId: null,
      oldAssetId: '019a7006-2c3d-7e4f-8a5b-6c7d8e9f0a14',
    };
    const abandoned: UserAvatarUploadAbandonedV1 = {
      id: '019a7006-2c3d-7e4f-8a5b-6c7d8e9f0a13',
      occurredAt: '2026-11-20T10:00:00Z',
      organizationId: null,
      actor: { type: 'system', id: 'identity-service' },
      userId: changed.userId,
      version: 1,
      uploadId: '019a7006-2c3d-7e4f-8a5b-6c7d8e9f0a16',
    };
    expect(eventSchemas['user.avatar-changed.v1'].parse(changed)).toEqual(changed);
    expect(eventSchemas['user.avatar-upload-abandoned.v1'].parse(abandoned)).toEqual(abandoned);
    expect(
      eventSchemas['user.avatar-changed.v1'].safeParse({
        ...changed,
        organizationId: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b2f',
      }).success,
    ).toBe(false);
    expect(
      eventSchemas['user.avatar-upload-abandoned.v1'].safeParse({ ...abandoned, version: 2 })
        .success,
    ).toBe(false);
    expect(
      eventSchemas['user.avatar-changed.v1'].safeParse({ ...changed, downloadUrl: '/private' })
        .success,
    ).toBe(false);
  });

  it('tells the security email and the directory what changed in two-step verification, without a secret', () => {
    const schema: (typeof eventSchemas)['user.two-step-verification-changed.v1'] =
      eventSchemas['user.two-step-verification-changed.v1'];
    const parsed: Record<string, unknown> = schema.parse({
      ...twoStepEnabled,
      backupCodes: ['4F7K-2M9Q'],
      secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
    });

    expect(parsed).toEqual(twoStepEnabled);
    expect(parsed).not.toHaveProperty('backupCodes');
    expect(parsed).not.toHaveProperty('secret');
    expect(
      schema.parse({
        ...twoStepEnabled,
        change: 'security-key-added',
        methods: ['authenticator-app', 'security-key'],
        securityKey: { id: '019a6c52-1d2e-7f3a-8b4c-5d6e7f8a9b01', name: 'YubiKey 5C NFC' },
      }),
    ).toMatchObject({ securityKey: { name: 'YubiKey 5C NFC' } });
  });

  it('keeps a change of two-step verification readable when later versions add a kind of change', () => {
    const schema: (typeof eventSchemas)['user.two-step-verification-changed.v1'] =
      eventSchemas['user.two-step-verification-changed.v1'];
    const withoutState: Partial<UserTwoStepVerificationChangedV1> = { ...twoStepEnabled };
    delete withoutState.enabled;

    expect(schema.safeParse({ ...twoStepEnabled, change: 'reset-by-administrator' }).success).toBe(
      true,
    );
    expect(
      schema.safeParse({
        ...twoStepEnabled,
        methods: ['authenticator-app', 'security-key', 'passkey'],
      }).success,
    ).toBe(true);
    expect(schema.safeParse(withoutState).success).toBe(false);
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

describe('routes of two-step verification', () => {
  it('confirms who the person is with a code of the app instead of the password', () => {
    expect(ReauthenticateBody.parse({ code: '261845' })).toEqual({ code: '261845' });
    expect(ReauthenticateBody.safeParse({ code: '261 845' }).success).toBe(false);
    expect(ReauthenticateInternalBody.parse({ password: 'atelier-nord-sprint-14' })).toEqual({
      password: 'atelier-nord-sprint-14',
    });
  });

  it('forwards the trusted device of the browser to both sign-ins', () => {
    const client: { ipAddress: string; userAgent: null } = {
      ipAddress: '86.247.12.30',
      userAgent: null,
    };
    const trustedDeviceToken: string = 'ExampleOnlyTrustedDeviceToken0000000000000';

    expect(
      SignInWithPasswordInternalBody.parse({
        email: 'camille.martin@ateliernord.fr',
        password: 'atelier-nord-sprint-14',
        client,
        trustedDeviceToken,
      }),
    ).toMatchObject({ trustedDeviceToken });
    expect(
      SignInWithCodeInternalBody.parse({
        email: 'camille.martin@ateliernord.fr',
        code: '482913',
        client,
        trustedDeviceToken,
      }),
    ).toMatchObject({ trustedDeviceToken });
  });

  it('validates the challenge of a sign-in with the validator of its inspection', () => {
    expect(InspectSignInChallengeInternalResponse.parse(signInChallenge)).toEqual(signInChallenge);
    expect(
      InspectSignInChallengeInternalResponse.safeParse({
        ...signInChallenge,
        methods: ['authenticator-app', 'security-key', 'backup-code', 'passkey'],
      }).success,
    ).toBe(true);
    expect(
      InspectSignInChallengeInternalResponse.safeParse({ ...signInChallenge, token: 'short' })
        .success,
    ).toBe(false);
  });

  it('trusts the device only when the person asks, and returns the device token to the gateway only', () => {
    expect(
      AnswerSignInChallengeWithAuthenticatorAppBody.parse({
        token: CHALLENGE_TOKEN,
        code: '261845',
      }),
    ).toEqual({ token: CHALLENGE_TOKEN, code: '261845', trustDevice: false });
    expect(
      AnswerSignInChallengeWithAuthenticatorAppInternalResponse.parse({
        token: 'example-session-token',
        session: {
          id: '019a6914-2f7a-7b3c-9d4e-5f6a7b8c9d01',
          expiresAt: '2026-12-09T07:42:00Z',
          persistent: true,
        },
        user: {
          id: USER_ID,
          name: 'Camille Martin',
          email: 'camille.martin@ateliernord.fr',
          language: 'fr',
          version: 9,
        },
        trustedDevice: {
          token: 'ExampleOnlyTrustedDeviceToken0000000000000',
          expiresAt: '2026-12-09T07:42:00Z',
        },
      }),
    ).toHaveProperty('trustedDevice.expiresAt', '2026-12-09T07:42:00Z');
  });

  it('reads a backup code without regard to case or dash, and refuses another shape', () => {
    expect(
      AnswerSignInChallengeWithBackupCodeBody.safeParse({
        token: CHALLENGE_TOKEN,
        code: '4f7k2m9q',
      }).success,
    ).toBe(true);
    expect(
      AnswerSignInChallengeWithBackupCodeBody.safeParse({
        token: CHALLENGE_TOKEN,
        code: '4F7K-2M9',
      }).success,
    ).toBe(false);
  });

  it('passes on the members of a WebAuthn answer and of its options that the contract does not list', () => {
    const credential: Record<string, unknown> = {
      id: 'ExampleOnlyCredentialIdYubiKey5CNfc0000000',
      rawId: 'ExampleOnlyCredentialIdYubiKey5CNfc0000000',
      type: 'public-key',
      response: {
        clientDataJSON: 'ExampleOnlyClientDataJson',
        authenticatorData: 'ExampleOnlyAuthenticatorData',
        signature: 'ExampleOnlySignature',
        userHandle: null,
        futureMember: 'kept',
      },
      clientExtensionResults: { appid: false },
    };
    const options: Record<string, unknown> = {
      options: {
        challenge: 'ExampleOnlyWebAuthnChallenge000000000000000',
        rp: { id: 'cadenway.com', name: 'Cadenway' },
        user: {
          id: 'ExampleOnlyWebAuthnUserHandle00000000000000',
          name: 'camille.martin@ateliernord.fr',
          displayName: 'Camille Martin',
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -8 }],
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
        hints: ['security-key'],
      },
      expiresAt: '2026-11-09T13:26:00Z',
    };

    expect(
      AnswerSignInChallengeWithSecurityKeyBody.parse({ token: CHALLENGE_TOKEN, credential }),
    ).toEqual({ token: CHALLENGE_TOKEN, credential, trustDevice: false });
    expect(StartSecurityKeyRegistrationInternalResponse.parse(options)).toEqual(options);
  });

  it('returns ten backup codes once on the first setup, and none on a reconfiguration', () => {
    const state: Record<string, unknown> = {
      enabled: true,
      primaryMethod: 'authenticator-app',
      methods: ['authenticator-app'],
      authenticatorApp: { configuredAt: '2026-11-09T13:21:00Z' },
      securityKeys: [],
      backupCodes: { remaining: 10, total: 10, generatedAt: '2026-11-09T13:21:00Z' },
      requiredBy: [],
    };
    const codes: string[] = [
      '4F7K-2M9Q',
      'H3XP-8D2L',
      'Q9TZ-5W1C',
      'B6NR-7J4E',
      'K2VD-9S8A',
      'M8LC-3F6P',
      'T5QW-1H7Z',
      'R4GY-6B3N',
      'C7EJ-2K5U',
      'W1PS-8V9D',
    ];

    expect(
      ConfirmAuthenticatorAppSetupResponse.parse({
        twoStepVerification: state,
        backupCodes: { codes, generatedAt: '2026-11-09T13:21:00Z' },
      }),
    ).toHaveProperty('backupCodes.codes', codes);
    expect(
      ConfirmAuthenticatorAppSetupResponse.parse({ twoStepVerification: state, backupCodes: null }),
    ).toHaveProperty('backupCodes', null);
    expect(
      ConfirmAuthenticatorAppSetupResponse.safeParse({
        twoStepVerification: state,
        backupCodes: { codes: codes.slice(1), generatedAt: '2026-11-09T13:21:00Z' },
      }).success,
    ).toBe(false);
  });

  it('withholds the organization of a session or a token without giving its context', () => {
    const withheld: { organizationId: string; code: string } = {
      organizationId: '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b2f',
      code: 'organization.mfa-required',
    };

    expect(
      IntrospectTokenResponse.parse({
        active: true,
        tokenType: 'session',
        sessionId: '019a6a31-5c2d-7e4f-9a6b-3d8c7f2e5b71',
        userId: USER_ID,
        organizationId: null,
        role: null,
        scopes: ['tasks:read', 'tasks:write', 'members:read', 'webhooks:manage'],
        expiresAt: '2026-12-08T13:07:00Z',
        withheldOrganization: withheld,
      }),
    ).toMatchObject({ organizationId: null, withheldOrganization: withheld });
    expect(
      IntrospectApiTokenResponse.parse({
        active: true,
        tokenType: 'api-token',
        apiTokenId: '019a6c30-7a8b-7c9d-8e0f-1a2b3c4d5e91',
        userId: USER_ID,
        organizationId: withheld.organizationId,
        role: 'member',
        scopes: [],
        expiresAt: null,
        withheldOrganization: withheld,
      }),
    ).toMatchObject({ scopes: [], withheldOrganization: withheld });
  });

  it('accepts only the session inactivities of the organization policy', () => {
    expect(UpdateAuthenticationPolicyBody.parse({ sessionInactivityTimeoutMinutes: 60 })).toEqual({
      sessionInactivityTimeoutMinutes: 60,
    });
    expect(
      UpdateAuthenticationPolicyBody.safeParse({ sessionInactivityTimeoutMinutes: 180 }).success,
    ).toBe(false);
    expect(
      UpdateAuthenticationPolicyBody.safeParse({ twoStepVerificationRequiredFor: 'owner' }).success,
    ).toBe(false);
  });
});

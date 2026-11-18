import { describe, expect, it } from 'vitest';

import { Role as ClientRole } from '../../packages/api-client/src/generated/public/organizations/model/role';
import {
  EVENT_NAMES as IDENTITY_EVENT_NAMES,
  eventSchemas as identityEventSchemas,
  type UserProfileUpdatedV1,
} from '../../packages/contracts/src/generated/events/identity-service';
import {
  EVENT_NAMES,
  RESTRICTED_EVENT_NAMES,
  eventSchemas,
  type InvitationIssuedV1,
  type MemberJoinedV1,
} from '../../packages/contracts/src/generated/events/organization-service';
import { Role as IdentityRole } from '../../packages/contracts/src/generated/types/internal/identity-service';
import { Role as InternalOrganizationRole } from '../../packages/contracts/src/generated/types/internal/organization-service';
import { Role as MembersRole } from '../../packages/contracts/src/generated/types/public/members';
import { Role as OrganizationRole } from '../../packages/contracts/src/generated/types/public/organizations';
import {
  CreateApiTokenInternalResponse,
  IntrospectApiTokenResponse,
  IntrospectTokenResponse,
  ListApiTokensInternalQueryParams,
} from '../../packages/contracts/src/generated/validators/internal/identity-service';
import {
  GetMemberInternalResponse,
  ListInvitationsInternalQueryParams,
  ListMembersInternalQueryParams,
} from '../../packages/contracts/src/generated/validators/internal/organization-service';
import { CreateApiTokenBody } from '../../packages/contracts/src/generated/validators/public/api-tokens';
import { UpdateCurrentUserBody } from '../../packages/contracts/src/generated/validators/public/auth';
import {
  ChangeMemberRoleBody,
  GetMemberResponse,
  InviteMembersBody,
  ListMembersQueryParams,
} from '../../packages/contracts/src/generated/validators/public/members';
import {
  CreateOrganizationBody,
  UpdateCurrentOrganizationBody,
} from '../../packages/contracts/src/generated/validators/public/organizations';

// Pins what the consumers of the organization contracts rely on: which events exist and that none
// is restricted, the roles a request can give (never `owner`), the defaults the creation form leaves
// out, the scopes a personal API token can hold, and the answers of the two introspections.

/**
 * Constant ORGANIZATION_ID
 *
 * @description
 * UUID v7 standing for Atelier Nord, the organization of the mockup data.
 *
 * @type {string}
 */
const ORGANIZATION_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b2f';

/**
 * Constant CAMILLE_ID
 *
 * @description
 * UUID v7 standing for the account of Camille Martin, the owner of Atelier Nord.
 *
 * @type {string}
 */
const CAMILLE_ID: string = '019a5f3c-8d2e-7c4a-9b1f-3e5d7a9c1b30';

/**
 * Constant INES_ID
 *
 * @description
 * UUID v7 standing for the account of Inès Robert, an admin of Atelier Nord.
 *
 * @type {string}
 */
const INES_ID: string = '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31';

/**
 * Constant SCOPES
 *
 * @description
 * The scopes of a personal API token, the set `cadenway/security-scopes` accepts.
 *
 * @type {readonly string[]}
 */
const SCOPES: readonly string[] = ['tasks:read', 'tasks:write', 'members:read', 'webhooks:manage'];

/**
 * Constant invitationIssued
 *
 * @description
 * Payload of `invitation.issued.v1` for the invitation of Marc Roux by Inès Robert.
 *
 * @type {InvitationIssuedV1}
 */
const invitationIssued: InvitationIssuedV1 = {
  id: '019a6d40-1b2c-7d3e-8f4a-5b6c7d8e9f00',
  occurredAt: '2026-11-06T16:20:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: INES_ID },
  version: 1,
  invitationId: '019a6b10-3c4d-7e5f-8a6b-7c8d9e0f1a70',
  email: 'marc.roux@ateliernord.fr',
  role: 'member',
  inviter: { userId: INES_ID, name: 'Inès Robert' },
  organization: { name: 'Atelier Nord', memberCount: 18 },
  expiresAt: '2026-11-13T16:20:00Z',
  language: 'fr',
};

/**
 * Constant ownerJoined
 *
 * @description
 * Payload of `member.joined.v1` for the owner, at the creation of Atelier Nord.
 *
 * @type {MemberJoinedV1}
 */
const ownerJoined: MemberJoinedV1 = {
  id: '019a6d40-1b2c-7d3e-8f4a-5b6c7d8e9f01',
  occurredAt: '2026-03-02T09:00:00Z',
  organizationId: ORGANIZATION_ID,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 1,
  memberId: '019a5f3d-1a2b-7c3d-8e4f-5a6b7c8d9e40',
  userId: CAMILLE_ID,
  role: 'owner',
  invitationId: null,
};

/**
 * Constant profileUpdated
 *
 * @description
 * Payload of `user.profile-updated.v1` for the profile of Camille Martin in the mockup.
 *
 * @type {UserProfileUpdatedV1}
 */
const profileUpdated: UserProfileUpdatedV1 = {
  id: '019a6d40-1b2c-7d3e-8f4a-5b6c7d8e9f02',
  occurredAt: '2026-11-08T13:30:00Z',
  organizationId: null,
  actor: { type: 'user', id: CAMILLE_ID },
  version: 3,
  userId: CAMILLE_ID,
  name: 'Camille Martin',
  displayName: 'camille',
  jobTitle: 'Responsable produit',
  timeZone: 'Europe/Paris',
  language: 'fr',
  changed: ['displayName', 'jobTitle'],
};

describe('events of organization-service', () => {
  it('names the six events and restricts none of them', () => {
    expect(EVENT_NAMES).toEqual([
      'invitation.issued.v1',
      'member.joined.v1',
      'member.removed.v1',
      'member.role-changed.v1',
      'organization.created.v1',
      'organization.updated.v1',
    ]);
    expect(RESTRICTED_EVENT_NAMES).toEqual([]);
  });

  it('carries what the invitation email shows, and never proposes the owner role', () => {
    const schema: (typeof eventSchemas)['invitation.issued.v1'] =
      eventSchemas['invitation.issued.v1'];

    expect(schema.parse(invitationIssued)).toEqual(invitationIssued);
    expect(schema.safeParse({ ...invitationIssued, role: 'owner' }).success).toBe(false);
    expect(schema.safeParse({ ...invitationIssued, organizationId: null }).success).toBe(false);
  });

  it('lets the owner join without an invitation', () => {
    expect(eventSchemas['member.joined.v1'].parse(ownerJoined)).toEqual(ownerJoined);
  });
});

describe('profile of an account', () => {
  it('publishes the whole profile after a change, outside any organization', () => {
    expect(IDENTITY_EVENT_NAMES).toContain('user.profile-updated.v1');
    expect(identityEventSchemas['user.profile-updated.v1'].parse(profileUpdated)).toEqual(
      profileUpdated,
    );
  });

  it('clears the optional members of the profile with null', () => {
    expect(UpdateCurrentUserBody.parse({ displayName: null, jobTitle: null })).toEqual({
      displayName: null,
      jobTitle: null,
    });
    expect(UpdateCurrentUserBody.safeParse({ language: 'it' }).success).toBe(false);
  });
});

describe('routes of organizations and members', () => {
  it('publishes the same organization role in the existing generated entry points', () => {
    expect(Object.values(OrganizationRole)).toEqual(['owner', 'admin', 'member', 'guest']);
    expect(IdentityRole).toEqual(OrganizationRole);
    expect(InternalOrganizationRole).toEqual(OrganizationRole);
    expect(MembersRole).toEqual(OrganizationRole);
    expect(ClientRole).toEqual(OrganizationRole);
  });

  it('fills the defaults of the creation form and checks an address given', () => {
    expect(CreateOrganizationBody.parse({ name: 'Atelier Nord' })).toEqual({
      name: 'Atelier Nord',
      teamSize: '6-20',
      primaryUse: 'product-engineering',
      inviteEmails: [],
    });
    expect(
      CreateOrganizationBody.safeParse({ name: 'Atelier Nord', slug: 'Atelier-Nord' }).success,
    ).toBe(false);
    expect(
      CreateOrganizationBody.safeParse({ name: 'Atelier Nord', slug: 'atelier--nord' }).success,
    ).toBe(false);
  });

  it('clears the description and the website of an organization with null', () => {
    expect(UpdateCurrentOrganizationBody.parse({ description: null, website: null })).toEqual({
      description: null,
      website: null,
    });
  });

  it('never gives the owner role by a change of role or an invitation', () => {
    expect(ChangeMemberRoleBody.safeParse({ role: 'owner' }).success).toBe(false);
    expect(ChangeMemberRoleBody.parse({ role: 'guest' })).toEqual({ role: 'guest' });
    expect(
      InviteMembersBody.safeParse({ emails: ['marc.roux@ateliernord.fr'], role: 'owner' }).success,
    ).toBe(false);
  });

  it('invites as member by default and needs at least one address', () => {
    expect(InviteMembersBody.parse({ emails: ['marc.roux@ateliernord.fr'] })).toEqual({
      emails: ['marc.roux@ateliernord.fr'],
      role: 'member',
    });
    expect(InviteMembersBody.safeParse({ emails: [] }).success).toBe(false);
  });

  it('filters the member list by known roles only', () => {
    expect(ListMembersQueryParams.parse({ role: ['owner', 'admin'] })).toEqual({
      role: ['owner', 'admin'],
      limit: 50,
    });
    expect(ListMembersQueryParams.safeParse({ role: ['viewer'] }).success).toBe(false);
  });

  it('shows the column "Deux étapes" to the owner and the admins, and nothing to the others', () => {
    const member: Record<string, unknown> = {
      id: '019a5f3d-1a2b-7c3d-8e4f-5a6b7c8d9e41',
      userId: '019a5f3c-9e1f-7b2a-8c3d-4e5f6a7b8c31',
      name: 'Inès Robert',
      email: 'ines.robert@ateliernord.fr',
      role: 'admin',
      joinedAt: '2026-03-03T09:40:00Z',
      version: 2,
    };

    expect(
      GetMemberInternalResponse.parse({ ...member, twoStepVerificationEnabled: true }),
    ).toEqual({ ...member, twoStepVerificationEnabled: true });
    expect(GetMemberResponse.parse(member)).toEqual(member);
    expect(
      GetMemberResponse.safeParse({ ...member, twoStepVerificationEnabled: 'Configurée' }).success,
    ).toBe(false);
  });
});

describe('page size read from a query string', () => {
  it('accepts the page size as the text a query string carries', () => {
    expect(ListMembersQueryParams.parse({ limit: '8' })).toEqual({ limit: 8 });
    expect(ListMembersInternalQueryParams.parse({ limit: '8' })).toEqual({ limit: 8 });
    expect(ListInvitationsInternalQueryParams.parse({ limit: '100' })).toEqual({ limit: 100 });
    expect(ListApiTokensInternalQueryParams.parse({ limit: '20' })).toEqual({ limit: 20 });
  });

  it('still applies the default when the page size is absent', () => {
    expect(ListApiTokensInternalQueryParams.parse({})).toEqual({ limit: 50 });
  });

  it('refuses a page size that is not a whole number from 1 to 100', () => {
    for (const limit of ['abc', '', '0', '101', '8.5']) {
      expect(ListMembersQueryParams.safeParse({ limit }).success).toBe(false);
      expect(ListInvitationsInternalQueryParams.safeParse({ limit }).success).toBe(false);
      expect(ListApiTokensInternalQueryParams.safeParse({ limit }).success).toBe(false);
    }
  });

  it('keeps the cursor and the search as text', () => {
    expect(ListMembersQueryParams.parse({ cursor: '8', search: '42' })).toEqual({
      cursor: '8',
      search: '42',
      limit: 50,
    });
  });
});

describe('personal API tokens', () => {
  it('accepts every scope of the set, expires in 30 days by default, and refuses another scope', () => {
    expect(
      CreateApiTokenBody.parse({ name: 'Synchronisation GitLab', scopes: [...SCOPES] }),
    ).toEqual({
      name: 'Synchronisation GitLab',
      scopes: SCOPES,
      expiration: '30-days',
    });
    expect(
      CreateApiTokenBody.safeParse({ name: 'Synchronisation GitLab', scopes: ['tasks:delete'] })
        .success,
    ).toBe(false);
    expect(
      CreateApiTokenBody.safeParse({ name: 'Synchronisation GitLab', scopes: [] }).success,
    ).toBe(false);
  });

  it('returns a secret of the cw_pat_ format once, beside the token', () => {
    const apiToken: Record<string, unknown> = {
      id: '019a6c30-7a8b-7c9d-8e0f-1a2b3c4d5e90',
      name: 'Synchronisation GitLab',
      prefix: 'cw_pat_Exam',
      scopes: ['tasks:read'],
      organizationId: ORGANIZATION_ID,
      createdAt: '2026-11-08T14:02:00Z',
      expiresAt: null,
      lastUsedAt: null,
    };

    expect(
      CreateApiTokenInternalResponse.safeParse({
        apiToken,
        secret: 'cw_pat_ExampleOnlyNotARealToken000000000000',
      }).success,
    ).toBe(true);
    expect(
      CreateApiTokenInternalResponse.safeParse({ apiToken, secret: 'cw_pat_tooShort' }).success,
    ).toBe(false);
  });

  it('introspects a personal token without a session and possibly without expiry', () => {
    const active: Record<string, unknown> = {
      active: true,
      tokenType: 'api-token',
      apiTokenId: '019a6c30-7a8b-7c9d-8e0f-1a2b3c4d5e90',
      userId: CAMILLE_ID,
      organizationId: ORGANIZATION_ID,
      role: 'owner',
      scopes: ['tasks:read'],
      expiresAt: null,
    };

    expect(IntrospectApiTokenResponse.parse(active)).toEqual(active);
    expect(IntrospectApiTokenResponse.parse({ active: false })).toEqual({ active: false });
    expect(IntrospectApiTokenResponse.safeParse({ ...active, organizationId: null }).success).toBe(
      false,
    );
  });

  it('keeps the session introspection, now with the current organization and every scope', () => {
    expect(
      IntrospectTokenResponse.parse({
        active: true,
        tokenType: 'session',
        sessionId: '019a6a2e-4b1c-7d3e-8f5a-2c9b7e1d4a60',
        userId: CAMILLE_ID,
        organizationId: ORGANIZATION_ID,
        role: 'owner',
        scopes: [...SCOPES],
        expiresAt: '2026-12-08T13:07:00Z',
      }),
    ).toMatchObject({ organizationId: ORGANIZATION_ID, role: 'owner' });
  });
});

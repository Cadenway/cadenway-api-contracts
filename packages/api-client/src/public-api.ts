/**
 * Public API of `@cadenway/api-client`: the Angular services generated from the public OpenAPI
 * documents, with the types of their parameters and results.
 *
 * One explicit export per generated declaration. A declaration that several documents generate
 * with the same shape (`Problem`, `Email`, `Role`, the error responses that alias `Problem`) is
 * exported once, from the first document below that generates it; `NextCursor`, which every
 * document receives from components/http.yaml, from the first one that paginates. A generated
 * enumeration is a constant and a type of the same name, exported together.
 */

// openapi/public/auth.yaml
export {
  AuthService,
  type DiscoverSignInMethodsClientResult,
  type GetCurrentUserClientResult,
  type RequestSignInCodeClientResult,
  type ResendSignUpCodeClientResult,
  type SignInWithCodeClientResult,
  type SignInWithPasswordClientResult,
  type SignOutClientResult,
  type SignUpClientResult,
  type UpdateCurrentUserClientResult,
  type VerifySignUpClientResult,
} from './generated/public/auth/auth/auth.service';
export type { AccountLockedResponse } from './generated/public/auth/model/accountLockedResponse';
export type { ApiTokenNotAcceptedResponse } from './generated/public/auth/model/apiTokenNotAcceptedResponse';
export type { BadRequestResponse } from './generated/public/auth/model/badRequestResponse';
export type { CodeRefusedResponse } from './generated/public/auth/model/codeRefusedResponse';
export type { CodeRequest } from './generated/public/auth/model/codeRequest';
export type { CodeSent } from './generated/public/auth/model/codeSent';
export type { CodeThrottledResponse } from './generated/public/auth/model/codeThrottledResponse';
export type { CodeVerification } from './generated/public/auth/model/codeVerification';
export type { CredentialsRefusedResponse } from './generated/public/auth/model/credentialsRefusedResponse';
export type { CrossSiteRefusedResponse } from './generated/public/auth/model/crossSiteRefusedResponse';
export type { CurrentUser } from './generated/public/auth/model/currentUser';
export type { Email } from './generated/public/auth/model/email';
export type { EmailNotVerifiedResponse } from './generated/public/auth/model/emailNotVerifiedResponse';
export type { EmailTakenResponse } from './generated/public/auth/model/emailTakenResponse';
export type { Language } from './generated/public/auth/model/language';
export type { Password } from './generated/public/auth/model/password';
export type { PasswordSignIn } from './generated/public/auth/model/passwordSignIn';
export type { Problem } from './generated/public/auth/model/problem';
export type { ProblemDetails } from './generated/public/auth/model/problemDetails';
export type { ProfileForbiddenResponse } from './generated/public/auth/model/profileForbiddenResponse';
export type { ProfilePatch } from './generated/public/auth/model/profilePatch';
export { ProfilePatchLanguage } from './generated/public/auth/model/profilePatchLanguage';
export type { RateLimitedResponse } from './generated/public/auth/model/rateLimitedResponse';
export type { Session } from './generated/public/auth/model/session';
export type { SignedIn } from './generated/public/auth/model/signedIn';
export type { SignedInResponse } from './generated/public/auth/model/signedInResponse';
export type { SignInMethod } from './generated/public/auth/model/signInMethod';
export type { SignInMethods } from './generated/public/auth/model/signInMethods';
export type { SignInMethodsRequest } from './generated/public/auth/model/signInMethodsRequest';
export type { SignOutRequest } from './generated/public/auth/model/signOutRequest';
export type { SignUpRefusedResponse } from './generated/public/auth/model/signUpRefusedResponse';
export type { SignUpRequest } from './generated/public/auth/model/signUpRequest';
export type { SignUpVerification } from './generated/public/auth/model/signUpVerification';
export type { SignUpVerificationRefusedResponse } from './generated/public/auth/model/signUpVerificationRefusedResponse';
export type { TimeZone } from './generated/public/auth/model/timeZone';
export type { UnauthenticatedResponse } from './generated/public/auth/model/unauthenticatedResponse';
export type { UnavailableResponse } from './generated/public/auth/model/unavailableResponse';
export type { VersionMismatchResponse } from './generated/public/auth/model/versionMismatchResponse';

// openapi/public/organizations.yaml
export {
  OrganizationsService,
  type CreateOrganizationClientResult,
  type GetCurrentOrganizationClientResult,
  type ListMyOrganizationsClientResult,
  type SwitchOrganizationClientResult,
  type UpdateCurrentOrganizationClientResult,
} from './generated/public/organizations/organizations/organizations.service';
export type { CreatorUnknownResponse } from './generated/public/organizations/model/creatorUnknownResponse';
export { DefaultLanguage } from './generated/public/organizations/model/defaultLanguage';
export type { IfMatchParameter } from './generated/public/organizations/model/ifMatchParameter';
export type { InvitationResult } from './generated/public/organizations/model/invitationResult';
export type { ListMyOrganizationsParams } from './generated/public/organizations/model/listMyOrganizationsParams';
export type { MyOrganization } from './generated/public/organizations/model/myOrganization';
export type { MyOrganizationPage } from './generated/public/organizations/model/myOrganizationPage';
export type { NextCursor } from './generated/public/organizations/model/nextCursor';
export type { Organization } from './generated/public/organizations/model/organization';
export type { OrganizationChoice } from './generated/public/organizations/model/organizationChoice';
export type { OrganizationCreated } from './generated/public/organizations/model/organizationCreated';
export type { OrganizationCreation } from './generated/public/organizations/model/organizationCreation';
export { OrganizationCreationPrimaryUse } from './generated/public/organizations/model/organizationCreationPrimaryUse';
export { OrganizationCreationTeamSize } from './generated/public/organizations/model/organizationCreationTeamSize';
export type { OrganizationName } from './generated/public/organizations/model/organizationName';
export type { OrganizationNotFoundResponse } from './generated/public/organizations/model/organizationNotFoundResponse';
export type { OrganizationPatch } from './generated/public/organizations/model/organizationPatch';
export type { OrganizationReadForbiddenResponse } from './generated/public/organizations/model/organizationReadForbiddenResponse';
export type { OrganizationWriteForbiddenResponse } from './generated/public/organizations/model/organizationWriteForbiddenResponse';
export { Role } from './generated/public/organizations/model/role';
export type { SessionOrganization } from './generated/public/organizations/model/sessionOrganization';
export type { SessionReadForbiddenResponse } from './generated/public/organizations/model/sessionReadForbiddenResponse';
export type { SessionWriteForbiddenResponse } from './generated/public/organizations/model/sessionWriteForbiddenResponse';
export type { Slug } from './generated/public/organizations/model/slug';
export type { SlugInvalidResponse } from './generated/public/organizations/model/slugInvalidResponse';
export type { SlugTakenResponse } from './generated/public/organizations/model/slugTakenResponse';

// openapi/public/members.yaml
export {
  InvitationsService,
  type AcceptInvitationClientResult,
  type InviteMembersClientResult,
  type ListInvitationsClientResult,
  type ListReceivedInvitationsClientResult,
  type RefuseInvitationClientResult,
  type ResendInvitationClientResult,
  type RevokeInvitationClientResult,
} from './generated/public/members/invitations/invitations.service';
export {
  MembersService,
  type ChangeMemberRoleClientResult,
  type GetMemberClientResult,
  type ListMembersClientResult,
  type RemoveMemberClientResult,
} from './generated/public/members/members/members.service';
export { AssignableRole } from './generated/public/members/model/assignableRole';
export type { EmptyRequest } from './generated/public/members/model/emptyRequest';
export type { Invitation } from './generated/public/members/model/invitation';
export type { InvitationAnsweredResponse } from './generated/public/members/model/invitationAnsweredResponse';
export type { InvitationBatch } from './generated/public/members/model/invitationBatch';
export type { InvitationBatchResult } from './generated/public/members/model/invitationBatchResult';
export type { InvitationClosedResponse } from './generated/public/members/model/invitationClosedResponse';
export type { InvitationForbiddenResponse } from './generated/public/members/model/invitationForbiddenResponse';
export type { InvitationNotFoundResponse } from './generated/public/members/model/invitationNotFoundResponse';
export type { InvitationNotPendingResponse } from './generated/public/members/model/invitationNotPendingResponse';
export type { InvitationPage } from './generated/public/members/model/invitationPage';
export type { Inviter } from './generated/public/members/model/inviter';
export type { InvitingOrganization } from './generated/public/members/model/invitingOrganization';
export type { JoinedOrganization } from './generated/public/members/model/joinedOrganization';
export type { ListInvitationsParams } from './generated/public/members/model/listInvitationsParams';
export type { ListMembersParams } from './generated/public/members/model/listMembersParams';
export type { ListReceivedInvitationsParams } from './generated/public/members/model/listReceivedInvitationsParams';
export type { Member } from './generated/public/members/model/member';
export type { MemberNotFoundResponse } from './generated/public/members/model/memberNotFoundResponse';
export type { MemberPage } from './generated/public/members/model/memberPage';
export type { MemberPatch } from './generated/public/members/model/memberPatch';
export type { MembersReadForbiddenResponse } from './generated/public/members/model/membersReadForbiddenResponse';
export type { OwnerProtectedResponse } from './generated/public/members/model/ownerProtectedResponse';
export type { ReceivedInvitation } from './generated/public/members/model/receivedInvitation';
export type { ReceivedInvitationPage } from './generated/public/members/model/receivedInvitationPage';
export type { RoleCounts } from './generated/public/members/model/roleCounts';

// openapi/public/api-tokens.yaml
export {
  ApiTokensService,
  type CreateApiTokenClientResult,
  type ListApiTokensClientResult,
  type RevokeApiTokenClientResult,
} from './generated/public/api-tokens/api-tokens/api-tokens.service';
export type { ApiToken } from './generated/public/api-tokens/model/apiToken';
export type { ApiTokenCreated } from './generated/public/api-tokens/model/apiTokenCreated';
export type { ApiTokenCreation } from './generated/public/api-tokens/model/apiTokenCreation';
export { ApiTokenCreationExpiration } from './generated/public/api-tokens/model/apiTokenCreationExpiration';
export type { ApiTokenNotFoundResponse } from './generated/public/api-tokens/model/apiTokenNotFoundResponse';
export type { ApiTokenPage } from './generated/public/api-tokens/model/apiTokenPage';
export { ApiTokenScope } from './generated/public/api-tokens/model/apiTokenScope';
export type { ListApiTokensParams } from './generated/public/api-tokens/model/listApiTokensParams';
export type { TokenReadForbiddenResponse } from './generated/public/api-tokens/model/tokenReadForbiddenResponse';
export type { TokenWriteForbiddenResponse } from './generated/public/api-tokens/model/tokenWriteForbiddenResponse';

/**
 * Public API of `@cadenway/api-client`: the Angular services generated from the public OpenAPI
 * documents, with the types of their parameters and results.
 *
 * One explicit export per generated declaration. A declaration that several documents generate
 * with the same shape (`Problem`, `Email`, `Role`, the error responses that alias `Problem`) is
 * exported once, from the first document below that generates it; `NextCursor`, which every
 * document receives from components/http.yaml, from the first one that paginates; the schemas of
 * components/task.yaml, which each of the spaces, lists, tasks, access, archives and trash
 * documents generates whole, from the first of them. A generated enumeration is a constant and a
 * type of the same name, exported together.
 */

// openapi/public/auth.yaml
export {
  AuthService,
  type AnswerSignInChallengeWithAuthenticatorAppClientResult,
  type AnswerSignInChallengeWithBackupCodeClientResult,
  type AnswerSignInChallengeWithSecurityKeyClientResult,
  type ConfirmPasswordResetClientResult,
  type DiscoverSignInMethodsClientResult,
  type GetCurrentUserClientResult,
  type GetSignInChallengeSecurityKeyOptionsClientResult,
  type InspectPasswordResetLinkClientResult,
  type InspectSignInChallengeClientResult,
  type ReauthenticateClientResult,
  type RequestPasswordResetClientResult,
  type RequestSignInCodeClientResult,
  type ResendSignUpCodeClientResult,
  type SignInWithCodeClientResult,
  type SignInWithPasswordClientResult,
  type SignOutClientResult,
  type SignUpClientResult,
  type UpdateCurrentUserClientResult,
  type VerifySignUpClientResult,
} from './generated/public/auth/auth/auth.service';
export {
  AccountService,
  type ChangePasswordClientResult,
  type ConfirmEmailChangeClientResult,
  type RequestEmailChangeClientResult,
  type ScheduleAccountDeletionClientResult,
} from './generated/public/auth/account/account.service';
export {
  SessionsService,
  type ListSessionsClientResult,
  type RevokeOtherSessionsClientResult,
  type RevokeSessionClientResult,
} from './generated/public/auth/sessions/sessions.service';
export {
  TwoStepVerificationService,
  type AddSecurityKeyClientResult,
  type ConfirmAuthenticatorAppSetupClientResult,
  type DisableTwoStepVerificationClientResult,
  type GetTwoStepVerificationClientResult,
  type RegenerateBackupCodesClientResult,
  type RemoveSecurityKeyClientResult,
  type StartAuthenticatorAppSetupClientResult,
  type StartSecurityKeyRegistrationClientResult,
} from './generated/public/auth/two-step-verification/two-step-verification.service';
export type { AccountLockedResponse } from './generated/public/auth/model/accountLockedResponse';
export type { ApiTokenNotAcceptedResponse } from './generated/public/auth/model/apiTokenNotAcceptedResponse';
export type { AuthenticatorAppAnswer } from './generated/public/auth/model/authenticatorAppAnswer';
export type { AuthenticatorAppConfigured } from './generated/public/auth/model/authenticatorAppConfigured';
export type { AuthenticatorAppConfirmation } from './generated/public/auth/model/authenticatorAppConfirmation';
export type { AuthenticatorAppSetup } from './generated/public/auth/model/authenticatorAppSetup';
export type { BackupCodeAnswer } from './generated/public/auth/model/backupCodeAnswer';
export type { BackupCodes } from './generated/public/auth/model/backupCodes';
export type { BadRequestResponse } from './generated/public/auth/model/badRequestResponse';
export type { ChallengeAnsweredResponse } from './generated/public/auth/model/challengeAnsweredResponse';
export type { ChallengeExpiredResponse } from './generated/public/auth/model/challengeExpiredResponse';
export type { ChallengeIssuedResponse } from './generated/public/auth/model/challengeIssuedResponse';
export type { ChallengeToken } from './generated/public/auth/model/challengeToken';
export type { ChallengeTokenRequest } from './generated/public/auth/model/challengeTokenRequest';
export type { CodeRefusedResponse } from './generated/public/auth/model/codeRefusedResponse';
export type { CodeRequest } from './generated/public/auth/model/codeRequest';
export type { CodeSent } from './generated/public/auth/model/codeSent';
export type { CodeThrottledResponse } from './generated/public/auth/model/codeThrottledResponse';
export type { CodeVerification } from './generated/public/auth/model/codeVerification';
export type { CredentialsRefusedResponse } from './generated/public/auth/model/credentialsRefusedResponse';
export type { CrossSiteRefusedResponse } from './generated/public/auth/model/crossSiteRefusedResponse';
export type { CurrentUser } from './generated/public/auth/model/currentUser';
export type { DeletionScheduled } from './generated/public/auth/model/deletionScheduled';
export type { Device } from './generated/public/auth/model/device';
export type { Email } from './generated/public/auth/model/email';
export type { EmailChangeCodeRefusedResponse } from './generated/public/auth/model/emailChangeCodeRefusedResponse';
export type { EmailChangeCodeSent } from './generated/public/auth/model/emailChangeCodeSent';
export type { EmailChangeConfirmation } from './generated/public/auth/model/emailChangeConfirmation';
export type { EmailChangeRequest } from './generated/public/auth/model/emailChangeRequest';
export type { EmailNotVerifiedResponse } from './generated/public/auth/model/emailNotVerifiedResponse';
export type { EmailTakenResponse } from './generated/public/auth/model/emailTakenResponse';
export type { EmailUnchangedResponse } from './generated/public/auth/model/emailUnchangedResponse';
export type { EmptyRequest } from './generated/public/auth/model/emptyRequest';
export type { Language } from './generated/public/auth/model/language';
export type { ListSessionsParams } from './generated/public/auth/model/listSessionsParams';
export type { MfaRequiredByOrganizationResponse } from './generated/public/auth/model/mfaRequiredByOrganizationResponse';
export type { NextCursor } from './generated/public/auth/model/nextCursor';
export type { OpenSession } from './generated/public/auth/model/openSession';
export type { OpenSessionPage } from './generated/public/auth/model/openSessionPage';
export type { OrganizationOwnerResponse } from './generated/public/auth/model/organizationOwnerResponse';
export type { Password } from './generated/public/auth/model/password';
export type { PasswordChange } from './generated/public/auth/model/passwordChange';
export type { PasswordChangeRefusedResponse } from './generated/public/auth/model/passwordChangeRefusedResponse';
export type { PasswordRefusedResponse } from './generated/public/auth/model/passwordRefusedResponse';
export type { PasswordResetCompleted } from './generated/public/auth/model/passwordResetCompleted';
export type { PasswordResetConfirmation } from './generated/public/auth/model/passwordResetConfirmation';
export type { PasswordResetLink } from './generated/public/auth/model/passwordResetLink';
export type { PasswordResetLinkSent } from './generated/public/auth/model/passwordResetLinkSent';
export type { PasswordResetRefusedResponse } from './generated/public/auth/model/passwordResetRefusedResponse';
export type { PasswordResetRequest } from './generated/public/auth/model/passwordResetRequest';
export type { PasswordResetToken } from './generated/public/auth/model/passwordResetToken';
export type { PasswordSignIn } from './generated/public/auth/model/passwordSignIn';
export type { Problem } from './generated/public/auth/model/problem';
export type { ProblemDetails } from './generated/public/auth/model/problemDetails';
export type { ProfileForbiddenResponse } from './generated/public/auth/model/profileForbiddenResponse';
export type { ProfilePatch } from './generated/public/auth/model/profilePatch';
export { ProfilePatchLanguage } from './generated/public/auth/model/profilePatchLanguage';
export type { RateLimitedResponse } from './generated/public/auth/model/rateLimitedResponse';
export type { ReauthenticationRequest } from './generated/public/auth/model/reauthenticationRequest';
export type { RecentAuthentication } from './generated/public/auth/model/recentAuthentication';
export type { RecentAuthenticationForbiddenResponse } from './generated/public/auth/model/recentAuthenticationForbiddenResponse';
export type { ResetLinkExpiredResponse } from './generated/public/auth/model/resetLinkExpiredResponse';
export type { ResetThrottledResponse } from './generated/public/auth/model/resetThrottledResponse';
export type { ResetToken } from './generated/public/auth/model/resetToken';
export type { RevokedSessions } from './generated/public/auth/model/revokedSessions';
export type { SecurityKey } from './generated/public/auth/model/securityKey';
export type { SecurityKeyAddition } from './generated/public/auth/model/securityKeyAddition';
export type { SecurityKeyAnswer } from './generated/public/auth/model/securityKeyAnswer';
export type { SecurityKeyAnswerRefusedResponse } from './generated/public/auth/model/securityKeyAnswerRefusedResponse';
export type { SecurityKeyAssertion } from './generated/public/auth/model/securityKeyAssertion';
export type { SecurityKeyAssertionClientExtensionResults } from './generated/public/auth/model/securityKeyAssertionClientExtensionResults';
export type { SecurityKeyAssertionOptions } from './generated/public/auth/model/securityKeyAssertionOptions';
export type { SecurityKeyAssertionResponse } from './generated/public/auth/model/securityKeyAssertionResponse';
export type { SecurityKeyAttestation } from './generated/public/auth/model/securityKeyAttestation';
export type { SecurityKeyAttestationClientExtensionResults } from './generated/public/auth/model/securityKeyAttestationClientExtensionResults';
export type { SecurityKeyAttestationResponse } from './generated/public/auth/model/securityKeyAttestationResponse';
export type { SecurityKeyNotAddableResponse } from './generated/public/auth/model/securityKeyNotAddableResponse';
export type { SecurityKeyNotFoundResponse } from './generated/public/auth/model/securityKeyNotFoundResponse';
export type { SecurityKeyRegistration } from './generated/public/auth/model/securityKeyRegistration';
export type { SecurityKeyRegistrationRefusedResponse } from './generated/public/auth/model/securityKeyRegistrationRefusedResponse';
export type { Session } from './generated/public/auth/model/session';
export type { SessionNotFoundResponse } from './generated/public/auth/model/sessionNotFoundResponse';
export type { SessionWriteForbiddenResponse } from './generated/public/auth/model/sessionWriteForbiddenResponse';
export type { SetupCodeRefusedResponse } from './generated/public/auth/model/setupCodeRefusedResponse';
export type { SignedIn } from './generated/public/auth/model/signedIn';
export type { SignedInResponse } from './generated/public/auth/model/signedInResponse';
export type { SignInChallenge } from './generated/public/auth/model/signInChallenge';
export type { SignInChallengeSecurityKeysItem } from './generated/public/auth/model/signInChallengeSecurityKeysItem';
export type { SignInMethod } from './generated/public/auth/model/signInMethod';
export type { SignInMethods } from './generated/public/auth/model/signInMethods';
export type { SignInMethodsRequest } from './generated/public/auth/model/signInMethodsRequest';
export type { SignOutRequest } from './generated/public/auth/model/signOutRequest';
export type { SignUpRefusedResponse } from './generated/public/auth/model/signUpRefusedResponse';
export type { SignUpRequest } from './generated/public/auth/model/signUpRequest';
export type { SignUpVerification } from './generated/public/auth/model/signUpVerification';
export type { SignUpVerificationRefusedResponse } from './generated/public/auth/model/signUpVerificationRefusedResponse';
export type { TimeZone } from './generated/public/auth/model/timeZone';
export type { TrustDevice } from './generated/public/auth/model/trustDevice';
export type { TwoStepCode } from './generated/public/auth/model/twoStepCode';
export type { TwoStepCodeRefusedResponse } from './generated/public/auth/model/twoStepCodeRefusedResponse';
export type { TwoStepLockedResponse } from './generated/public/auth/model/twoStepLockedResponse';
export type { TwoStepMethod } from './generated/public/auth/model/twoStepMethod';
export type { TwoStepNotEnabledResponse } from './generated/public/auth/model/twoStepNotEnabledResponse';
export type { TwoStepRequirement } from './generated/public/auth/model/twoStepRequirement';
export type { TwoStepVerification } from './generated/public/auth/model/twoStepVerification';
export type { TwoStepVerificationAuthenticatorApp } from './generated/public/auth/model/twoStepVerificationAuthenticatorApp';
export type { TwoStepVerificationBackupCodes } from './generated/public/auth/model/twoStepVerificationBackupCodes';
export type { UnauthenticatedResponse } from './generated/public/auth/model/unauthenticatedResponse';
export type { UnavailableResponse } from './generated/public/auth/model/unavailableResponse';
export type { VersionMismatchResponse } from './generated/public/auth/model/versionMismatchResponse';
export type { WebAuthnCreationOptions } from './generated/public/auth/model/webAuthnCreationOptions';
export type { WebAuthnCreationOptionsPubKeyCredParamsItem } from './generated/public/auth/model/webAuthnCreationOptionsPubKeyCredParamsItem';
export type { WebAuthnCreationOptionsRp } from './generated/public/auth/model/webAuthnCreationOptionsRp';
export type { WebAuthnCreationOptionsUser } from './generated/public/auth/model/webAuthnCreationOptionsUser';
export type { WebAuthnCredentialDescriptor } from './generated/public/auth/model/webAuthnCredentialDescriptor';
export type { WebAuthnRequestOptions } from './generated/public/auth/model/webAuthnRequestOptions';

// openapi/public/organizations.yaml
export {
  OrganizationsService,
  type CreateOrganizationClientResult,
  type GetCurrentOrganizationClientResult,
  type ListMyOrganizationsClientResult,
  type SwitchOrganizationClientResult,
  type UpdateCurrentOrganizationClientResult,
} from './generated/public/organizations/organizations/organizations.service';
export {
  AuthenticationPolicyService,
  type GetAuthenticationPolicyClientResult,
  type UpdateAuthenticationPolicyClientResult,
} from './generated/public/organizations/authentication-policy/authentication-policy.service';
export type { AuthenticationPolicy } from './generated/public/organizations/model/authenticationPolicy';
export type { AuthenticationPolicyMembersWithoutTwoStepVerification } from './generated/public/organizations/model/authenticationPolicyMembersWithoutTwoStepVerification';
export type { AuthenticationPolicyPatch } from './generated/public/organizations/model/authenticationPolicyPatch';
export { AuthenticationPolicyPatchSessionInactivityTimeoutMinutes } from './generated/public/organizations/model/authenticationPolicyPatchSessionInactivityTimeoutMinutes';
export { AuthenticationPolicyPatchTwoStepVerificationRequiredFor } from './generated/public/organizations/model/authenticationPolicyPatchTwoStepVerificationRequiredFor';
export type { CreatorUnknownResponse } from './generated/public/organizations/model/creatorUnknownResponse';
export { DefaultLanguage } from './generated/public/organizations/model/defaultLanguage';
export type { IfMatchParameter } from './generated/public/organizations/model/ifMatchParameter';
export type { InvitationResult } from './generated/public/organizations/model/invitationResult';
export type { ListMyOrganizationsParams } from './generated/public/organizations/model/listMyOrganizationsParams';
export type { MyOrganization } from './generated/public/organizations/model/myOrganization';
export type { MyOrganizationPage } from './generated/public/organizations/model/myOrganizationPage';
export type { Organization } from './generated/public/organizations/model/organization';
export type { OrganizationChoice } from './generated/public/organizations/model/organizationChoice';
export type { OrganizationChoiceForbiddenResponse } from './generated/public/organizations/model/organizationChoiceForbiddenResponse';
export type { OrganizationCreated } from './generated/public/organizations/model/organizationCreated';
export type { OrganizationCreation } from './generated/public/organizations/model/organizationCreation';
export { OrganizationCreationPrimaryUse } from './generated/public/organizations/model/organizationCreationPrimaryUse';
export { OrganizationCreationTeamSize } from './generated/public/organizations/model/organizationCreationTeamSize';
export type { OrganizationName } from './generated/public/organizations/model/organizationName';
export type { OrganizationNotFoundResponse } from './generated/public/organizations/model/organizationNotFoundResponse';
export type { OrganizationPatch } from './generated/public/organizations/model/organizationPatch';
export type { OrganizationReadForbiddenResponse } from './generated/public/organizations/model/organizationReadForbiddenResponse';
export type { OrganizationWriteForbiddenResponse } from './generated/public/organizations/model/organizationWriteForbiddenResponse';
export type { PolicyWriteForbiddenResponse } from './generated/public/organizations/model/policyWriteForbiddenResponse';
export { Role } from './generated/public/organizations/model/role';
export type { SessionOrganization } from './generated/public/organizations/model/sessionOrganization';
export type { SessionReadForbiddenResponse } from './generated/public/organizations/model/sessionReadForbiddenResponse';
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
export type { Invitation } from './generated/public/members/model/invitation';
export type { InvitationAnsweredResponse } from './generated/public/members/model/invitationAnsweredResponse';
export type { InvitationBatch } from './generated/public/members/model/invitationBatch';
export type { InvitationBatchLimitedResponse } from './generated/public/members/model/invitationBatchLimitedResponse';
export type { InvitationBatchResult } from './generated/public/members/model/invitationBatchResult';
export type { InvitationClosedResponse } from './generated/public/members/model/invitationClosedResponse';
export type { InvitationForbiddenResponse } from './generated/public/members/model/invitationForbiddenResponse';
export type { InvitationNotFoundResponse } from './generated/public/members/model/invitationNotFoundResponse';
export type { InvitationNotPendingResponse } from './generated/public/members/model/invitationNotPendingResponse';
export type { InvitationPage } from './generated/public/members/model/invitationPage';
export type { InvitationResendLimitedResponse } from './generated/public/members/model/invitationResendLimitedResponse';
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
export type { TokenCreationForbiddenResponse } from './generated/public/api-tokens/model/tokenCreationForbiddenResponse';
export type { TokenWriteForbiddenResponse } from './generated/public/api-tokens/model/tokenWriteForbiddenResponse';

// openapi/public/spaces.yaml
export {
  SpacesService,
  type CreateSpaceClientResult,
  type DeleteSpaceClientResult,
  type GetSpaceClientResult,
  type GetSpaceOverviewClientResult,
  type ListSpacesClientResult,
  type ListSpaceMilestonesClientResult,
  type ListTaskTemplatesClientResult,
  type CreateTaskTemplateClientResult,
  type GetTaskTemplateClientResult,
  type DeleteTaskTemplateClientResult,
  type ListFavoritesClientResult,
  type CreateFavoriteClientResult,
  type GetFavoriteClientResult,
  type DeleteFavoriteClientResult,
  type UpdateSpaceClientResult,
} from './generated/public/spaces/spaces/spaces.service';
export type { TaskTemplate } from './generated/public/spaces/model/taskTemplate';
export type { TaskTemplateCreation } from './generated/public/spaces/model/taskTemplateCreation';
export type { TaskTemplatePage } from './generated/public/spaces/model/taskTemplatePage';
export type { ListTaskTemplatesParams } from './generated/public/spaces/model/listTaskTemplatesParams';
export type { Favorite } from './generated/public/spaces/model/favorite';
export type { FavoriteCreation } from './generated/public/spaces/model/favoriteCreation';
export type { FavoritePage } from './generated/public/spaces/model/favoritePage';
export type { FavoriteTarget } from './generated/public/spaces/model/favoriteTarget';
export type { ListFavoritesParams } from './generated/public/spaces/model/listFavoritesParams';
export type { TemplateCreateConflictResponse } from './generated/public/spaces/model/templateCreateConflictResponse';
export type { TemplateCreateRefusedResponse } from './generated/public/spaces/model/templateCreateRefusedResponse';
export type { TemplateNotFoundResponse } from './generated/public/spaces/model/templateNotFoundResponse';
export type { TemplateWriteForbiddenResponse } from './generated/public/spaces/model/templateWriteForbiddenResponse';
export type { TemplateSourceNotFoundResponse } from './generated/public/spaces/model/templateSourceNotFoundResponse';
export type { FavoriteCreateConflictResponse } from './generated/public/spaces/model/favoriteCreateConflictResponse';
export type { FavoriteCreateRefusedResponse } from './generated/public/spaces/model/favoriteCreateRefusedResponse';
export type { FavoriteNotFoundResponse } from './generated/public/spaces/model/favoriteNotFoundResponse';
export type { FavoriteTargetNotFoundResponse } from './generated/public/spaces/model/favoriteTargetNotFoundResponse';
export type { FavoriteWriteForbiddenResponse } from './generated/public/spaces/model/favoriteWriteForbiddenResponse';
export { FavoriteKindInput } from './generated/public/spaces/model/favoriteKindInput';
export type { MilestonePage } from './generated/public/spaces/model/milestonePage';
export type { ListSpaceMilestonesParams } from './generated/public/spaces/model/listSpaceMilestonesParams';
export { Recurrence } from './generated/public/spaces/model/recurrence';
export type { AccessRequest } from './generated/public/spaces/model/accessRequest';
export type { AccessRequestApproval } from './generated/public/spaces/model/accessRequestApproval';
export type { AccessRequestCreation } from './generated/public/spaces/model/accessRequestCreation';
export type { AccessRequestStateValue } from './generated/public/spaces/model/accessRequestStateValue';
export type { AccessRequestTargetValue } from './generated/public/spaces/model/accessRequestTargetValue';
export { AccessRole } from './generated/public/spaces/model/accessRole';
export type { AccessRoleValue } from './generated/public/spaces/model/accessRoleValue';
export type { ActivityEntry } from './generated/public/spaces/model/activityEntry';
export type { ActivityEntryAssignee } from './generated/public/spaces/model/activityEntryAssignee';
export type { ActivityEntryDueDate } from './generated/public/spaces/model/activityEntryDueDate';
export type { ActivityEntryPriority } from './generated/public/spaces/model/activityEntryPriority';
export type { ActivityEntryStatus } from './generated/public/spaces/model/activityEntryStatus';
export type { Actor } from './generated/public/spaces/model/actor';
export type { ArchivedList } from './generated/public/spaces/model/archivedList';
export type { ArchivedTask } from './generated/public/spaces/model/archivedTask';
export { CancelReason } from './generated/public/spaces/model/cancelReason';
export type { CancelReasonInput } from './generated/public/spaces/model/cancelReasonInput';
export type { ChecklistCounts } from './generated/public/spaces/model/checklistCounts';
export type { ChecklistItem } from './generated/public/spaces/model/checklistItem';
export type { ChecklistItemCreation } from './generated/public/spaces/model/checklistItemCreation';
export type { ChecklistItemPatch } from './generated/public/spaces/model/checklistItemPatch';
export type { EstimateMinutes } from './generated/public/spaces/model/estimateMinutes';
export type { GetSpaceOverviewParams } from './generated/public/spaces/model/getSpaceOverviewParams';
export type { Grant } from './generated/public/spaces/model/grant';
export type { GrantChange } from './generated/public/spaces/model/grantChange';
export type { IdempotencyKeyParameter } from './generated/public/spaces/model/idempotencyKeyParameter';
export type { IdempotencyKeyReusedResponse } from './generated/public/spaces/model/idempotencyKeyReusedResponse';
export type { LabelChange } from './generated/public/spaces/model/labelChange';
export type { LabelName } from './generated/public/spaces/model/labelName';
export type { ListCreation } from './generated/public/spaces/model/listCreation';
export { ListCreationColor } from './generated/public/spaces/model/listCreationColor';
export { ListCreationIcon } from './generated/public/spaces/model/listCreationIcon';
export type { ListName } from './generated/public/spaces/model/listName';
export type { ListPatch } from './generated/public/spaces/model/listPatch';
export type { ListRef } from './generated/public/spaces/model/listRef';
export type { ListSpacesParams } from './generated/public/spaces/model/listSpacesParams';
export type { ListStateValue } from './generated/public/spaces/model/listStateValue';
export type { ListSummary } from './generated/public/spaces/model/listSummary';
export { LookColor } from './generated/public/spaces/model/lookColor';
export type { LookColorValue } from './generated/public/spaces/model/lookColorValue';
export { LookIcon } from './generated/public/spaces/model/lookIcon';
export type { LookIconValue } from './generated/public/spaces/model/lookIconValue';
export type { PrefixTakenResponse } from './generated/public/spaces/model/prefixTakenResponse';
export { PriorityKey } from './generated/public/spaces/model/priorityKey';
export type { Space } from './generated/public/spaces/model/space';
export type { SpaceCreated } from './generated/public/spaces/model/spaceCreated';
export type { SpaceCreation } from './generated/public/spaces/model/spaceCreation';
export { SpaceCreationColor } from './generated/public/spaces/model/spaceCreationColor';
export type { SpaceCreationConflictResponse } from './generated/public/spaces/model/spaceCreationConflictResponse';
export type { SpaceCreationForbiddenResponse } from './generated/public/spaces/model/spaceCreationForbiddenResponse';
export { SpaceCreationIcon } from './generated/public/spaces/model/spaceCreationIcon';
export { SpaceCreationVisibility } from './generated/public/spaces/model/spaceCreationVisibility';
export type { SpaceDescription } from './generated/public/spaces/model/spaceDescription';
export type { SpaceManageForbiddenResponse } from './generated/public/spaces/model/spaceManageForbiddenResponse';
export type { SpaceName } from './generated/public/spaces/model/spaceName';
export type { SpaceNotFoundResponse } from './generated/public/spaces/model/spaceNotFoundResponse';
export type { SpaceOverview } from './generated/public/spaces/model/spaceOverview';
export type { SpacePage } from './generated/public/spaces/model/spacePage';
export type { SpacePatch } from './generated/public/spaces/model/spacePatch';
export type { SpacePrefix } from './generated/public/spaces/model/spacePrefix';
export type { SpaceStatus } from './generated/public/spaces/model/spaceStatus';
export type { SpaceStatuses } from './generated/public/spaces/model/spaceStatuses';
export type { SpaceStatusesPatch } from './generated/public/spaces/model/spaceStatusesPatch';
export type { SpaceStatusPatch } from './generated/public/spaces/model/spaceStatusPatch';
export type { SpaceWriteForbiddenResponse } from './generated/public/spaces/model/spaceWriteForbiddenResponse';
export type { Sprint } from './generated/public/spaces/model/sprint';
export type { SprintInput } from './generated/public/spaces/model/sprintInput';
export { StatusCategory } from './generated/public/spaces/model/statusCategory';
export { StatusKey } from './generated/public/spaces/model/statusKey';
export type { StatusRequiredResponse } from './generated/public/spaces/model/statusRequiredResponse';
export type { SubtaskCounts } from './generated/public/spaces/model/subtaskCounts';
export type { SubtaskCreation } from './generated/public/spaces/model/subtaskCreation';
export { SubtaskCreationPriority } from './generated/public/spaces/model/subtaskCreationPriority';
export { SubtaskCreationStatus } from './generated/public/spaces/model/subtaskCreationStatus';
export type { SubtaskName } from './generated/public/spaces/model/subtaskName';
export type { Task } from './generated/public/spaces/model/task';
export type { TaskCounts } from './generated/public/spaces/model/taskCounts';
export type { TaskCreation } from './generated/public/spaces/model/taskCreation';
export { TaskCreationPriority } from './generated/public/spaces/model/taskCreationPriority';
export { TaskCreationStatus } from './generated/public/spaces/model/taskCreationStatus';
export type { TaskDescription } from './generated/public/spaces/model/taskDescription';
export type { TaskKey } from './generated/public/spaces/model/taskKey';
export type { TaskList } from './generated/public/spaces/model/taskList';
export type { TaskName } from './generated/public/spaces/model/taskName';
export type { TaskPatch } from './generated/public/spaces/model/taskPatch';
export type { TaskRef } from './generated/public/spaces/model/taskRef';
export type { TasksReadForbiddenResponse } from './generated/public/spaces/model/tasksReadForbiddenResponse';
export type { TaskSummary } from './generated/public/spaces/model/taskSummary';
export type { TodayParameter } from './generated/public/spaces/model/todayParameter';
export type { TrashEmptied } from './generated/public/spaces/model/trashEmptied';
export type { TrashEntry } from './generated/public/spaces/model/trashEntry';
export type { TrashRestored } from './generated/public/spaces/model/trashRestored';
export type { UserRef } from './generated/public/spaces/model/userRef';
export { Visibility } from './generated/public/spaces/model/visibility';
export type { VisibilityValue } from './generated/public/spaces/model/visibilityValue';

// openapi/public/lists.yaml
export {
  ListsService,
  type CreateListClientResult,
  type DuplicateListClientResult,
  type ListSavedViewsClientResult,
  type CreateSavedViewClientResult,
  type GetSavedViewClientResult,
  type UpdateSavedViewClientResult,
  type DeleteSavedViewClientResult,
  type DuplicateSavedViewClientResult,
  type DeleteListClientResult,
  type GetListClientResult,
  type GetListCountsClientResult,
  type ListListActivityClientResult,
  type ListListsClientResult,
  type UpdateListClientResult,
} from './generated/public/lists/lists/lists.service';
export type { ActivityKindParameter } from './generated/public/lists/model/activityKindParameter';
export { ActivityKindParameterItem } from './generated/public/lists/model/activityKindParameterItem';
export type { ActivityPage } from './generated/public/lists/model/activityPage';
export type { ActorIdParameter } from './generated/public/lists/model/actorIdParameter';
export type { GetListCountsParams } from './generated/public/lists/model/getListCountsParams';
export type { SavedItemName } from './generated/public/lists/model/savedItemName';
export type { SavedView } from './generated/public/lists/model/savedView';
export type { SavedViewCreation } from './generated/public/lists/model/savedViewCreation';
export type { SavedViewPatch } from './generated/public/lists/model/savedViewPatch';
export type { SavedViewDuplicate } from './generated/public/lists/model/savedViewDuplicate';
export type { SavedViewPage } from './generated/public/lists/model/savedViewPage';
export type { SavedViewConfiguration } from './generated/public/lists/model/savedViewConfiguration';
export type { SavedViewConfigurationInput } from './generated/public/lists/model/savedViewConfigurationInput';
export type { SavedViewConfigurationPatch } from './generated/public/lists/model/savedViewConfigurationPatch';
export type { SavedViewFilters } from './generated/public/lists/model/savedViewFilters';
export type { SavedViewFiltersPatch } from './generated/public/lists/model/savedViewFiltersPatch';
export type { SavedViewPresentation } from './generated/public/lists/model/savedViewPresentation';
export type { SavedViewPresentationValue } from './generated/public/lists/model/savedViewPresentationValue';
export type { SavedViewPresentationPatch } from './generated/public/lists/model/savedViewPresentationPatch';
export type { SavedViewLayoutValue } from './generated/public/lists/model/savedViewLayoutValue';
export type { SavedViewSortValue } from './generated/public/lists/model/savedViewSortValue';
export type { SavedViewGroupByValue } from './generated/public/lists/model/savedViewGroupByValue';
export type { SavedViewSheetColumnValue } from './generated/public/lists/model/savedViewSheetColumnValue';
export type { ListSavedViewsParams } from './generated/public/lists/model/listSavedViewsParams';
export type { SavedViewCreateConflictResponse } from './generated/public/lists/model/savedViewCreateConflictResponse';
export type { SavedViewCreateRefusedResponse } from './generated/public/lists/model/savedViewCreateRefusedResponse';
export type { SavedViewNotFoundResponse } from './generated/public/lists/model/savedViewNotFoundResponse';
export type { SavedViewWriteConflictResponse } from './generated/public/lists/model/savedViewWriteConflictResponse';
export { SavedViewSort } from './generated/public/lists/model/savedViewSort';
export { SavedViewLayout } from './generated/public/lists/model/savedViewLayout';
export { SavedViewSheetColumn } from './generated/public/lists/model/savedViewSheetColumn';
export type { ListDuplicate } from './generated/public/lists/model/listDuplicate';
export type { ListDuplication } from './generated/public/lists/model/listDuplication';
export type { ListDuplicateConflictResponse } from './generated/public/lists/model/listDuplicateConflictResponse';
export type { ListDuplicateRefusedResponse } from './generated/public/lists/model/listDuplicateRefusedResponse';
export type { ListCreationRefusedResponse } from './generated/public/lists/model/listCreationRefusedResponse';
export type { ListListActivityParams } from './generated/public/lists/model/listListActivityParams';
export type { ListListsParams } from './generated/public/lists/model/listListsParams';
export type { ListNotFoundResponse } from './generated/public/lists/model/listNotFoundResponse';
export type { RequestInProgressResponse } from './generated/public/lists/model/requestInProgressResponse';
export type { SprintDatesInvalidResponse } from './generated/public/lists/model/sprintDatesInvalidResponse';
export type { TaskListPage } from './generated/public/lists/model/taskListPage';
export type { TasksWriteForbiddenResponse } from './generated/public/lists/model/tasksWriteForbiddenResponse';

// openapi/public/tasks.yaml
export {
  TasksService,
  type AddChecklistItemClientResult,
  type AddTaskLabelClientResult,
  type AssignTaskClientResult,
  type CreateSubtaskClientResult,
  type CreateTaskClientResult,
  type CreateTaskCommentClientResult,
  type CreateTaskDependencyClientResult,
  type DuplicateTaskClientResult,
  type ExecuteBulkTaskActionClientResult,
  type DeleteTaskDependencyClientResult,
  type GetTaskDependencyClientResult,
  type ListTaskDependenciesClientResult,
  type ListDependencyCandidatesClientResult,
  type DeleteTaskCommentClientResult,
  type FollowTaskWatcherClientResult,
  type GetTaskCommentClientResult,
  type ListTaskCommentsClientResult,
  type ListTaskParticipantsClientResult,
  type ListTaskWatchersClientResult,
  type UnfollowTaskWatcherClientResult,
  type UpdateTaskCommentClientResult,
  type GetTaskClientResult,
  type GetTaskDetailClientResult,
  type ListLabelsClientResult,
  type ListSubtasksClientResult,
  type RemoveTaskLabelClientResult,
  type UnassignTaskClientResult,
  type UpdateChecklistItemClientResult,
  type UpdateTaskClientResult,
} from './generated/public/tasks/tasks/tasks.service';
export {
  TaskQueriesService,
  type CountTaskGroupsClientResult,
  type ListTasksClientResult,
} from './generated/public/tasks/task-queries/task-queries.service';
export {
  TaskActivityService,
  type ListTaskActivityClientResult,
} from './generated/public/tasks/task-activity/task-activity.service';
export {
  MyTasksService,
  type GetHomeClientResult,
  type ListMyTasksClientResult,
} from './generated/public/tasks/my-tasks/my-tasks.service';
export type { AssigneeFilterParameter } from './generated/public/tasks/model/assigneeFilterParameter';
export type { AssigneeRefusedResponse } from './generated/public/tasks/model/assigneeRefusedResponse';
export type { BulkTaskAction } from './generated/public/tasks/model/bulkTaskAction';
export type { BulkTaskActionValue } from './generated/public/tasks/model/bulkTaskActionValue';
export type { BulkTaskSelection } from './generated/public/tasks/model/bulkTaskSelection';
export type { BulkTaskStatusAction } from './generated/public/tasks/model/bulkTaskStatusAction';
export type { BulkTaskPriorityAction } from './generated/public/tasks/model/bulkTaskPriorityAction';
export type { BulkTaskAssignAction } from './generated/public/tasks/model/bulkTaskAssignAction';
export type { BulkTaskUnassignAction } from './generated/public/tasks/model/bulkTaskUnassignAction';
export type { BulkTaskMoveAction } from './generated/public/tasks/model/bulkTaskMoveAction';
export type { BulkTaskTrashAction } from './generated/public/tasks/model/bulkTaskTrashAction';
export type { BulkTaskDuplicateAction } from './generated/public/tasks/model/bulkTaskDuplicateAction';
export type { BulkTaskResult } from './generated/public/tasks/model/bulkTaskResult';
export type { BulkTaskResultEntry } from './generated/public/tasks/model/bulkTaskResultEntry';
export type { TaskDuplicate } from './generated/public/tasks/model/taskDuplicate';
export type { TaskDuplicateConflictResponse } from './generated/public/tasks/model/taskDuplicateConflictResponse';
export type { TaskDuplicateRefusedResponse } from './generated/public/tasks/model/taskDuplicateRefusedResponse';
export type { BulkConflictResponse } from './generated/public/tasks/model/bulkConflictResponse';
export type { BulkRefusedResponse } from './generated/public/tasks/model/bulkRefusedResponse';
export type { BulkTargetNotFoundResponse } from './generated/public/tasks/model/bulkTargetNotFoundResponse';
export type { Dependency } from './generated/public/tasks/model/dependency';
export type { DependencyCreation } from './generated/public/tasks/model/dependencyCreation';
export { DependencyDirection } from './generated/public/tasks/model/dependencyDirection';
export type { DependencyPage } from './generated/public/tasks/model/dependencyPage';
export type { ListTaskDependenciesParams } from './generated/public/tasks/model/listTaskDependenciesParams';
export type { ListDependencyCandidatesParams } from './generated/public/tasks/model/listDependencyCandidatesParams';
export type { Comment } from './generated/public/tasks/model/comment';
export type { CommentCreation } from './generated/public/tasks/model/commentCreation';
export type { CommentPage } from './generated/public/tasks/model/commentPage';
export type { CommentPatch } from './generated/public/tasks/model/commentPatch';
export type { Mention } from './generated/public/tasks/model/mention';
export type { TaskParticipant } from './generated/public/tasks/model/taskParticipant';
export type { TaskParticipantPage } from './generated/public/tasks/model/taskParticipantPage';
export type { Watcher } from './generated/public/tasks/model/watcher';
export type { WatcherPage } from './generated/public/tasks/model/watcherPage';
export type { ListTaskCommentsParams } from './generated/public/tasks/model/listTaskCommentsParams';
export type { ListTaskParticipantsParams } from './generated/public/tasks/model/listTaskParticipantsParams';
export type { ListTaskWatchersParams } from './generated/public/tasks/model/listTaskWatchersParams';
export type { CollabAuthorResponse } from './generated/public/tasks/model/collabAuthorResponse';
export type { CollabRoleResponse } from './generated/public/tasks/model/collabRoleResponse';
export type { CollabCommentNotFoundResponse } from './generated/public/tasks/model/collabCommentNotFoundResponse';
export type { CollabCreateConflictResponse } from './generated/public/tasks/model/collabCreateConflictResponse';
export type { CollabCreateRefusedResponse } from './generated/public/tasks/model/collabCreateRefusedResponse';
export type { CollabMentionResponse } from './generated/public/tasks/model/collabMentionResponse';
export type { CollabWatcherRefusedResponse } from './generated/public/tasks/model/collabWatcherRefusedResponse';
export type { CommentVersionMismatchResponse } from './generated/public/tasks/model/commentVersionMismatchResponse';
export type { ChecklistItemConflictResponse } from './generated/public/tasks/model/checklistItemConflictResponse';
export type { ChecklistItemNotFoundResponse } from './generated/public/tasks/model/checklistItemNotFoundResponse';
export type { ChecklistItemRefusedResponse } from './generated/public/tasks/model/checklistItemRefusedResponse';
export type { CountTaskGroupsParams } from './generated/public/tasks/model/countTaskGroupsParams';
export type { DueFromParameter } from './generated/public/tasks/model/dueFromParameter';
export type { DueToParameter } from './generated/public/tasks/model/dueToParameter';
export type { GetHomeParams } from './generated/public/tasks/model/getHomeParams';
export { GroupByParameter } from './generated/public/tasks/model/groupByParameter';
export type { Home } from './generated/public/tasks/model/home';
export type { HomeStats } from './generated/public/tasks/model/homeStats';
export type { Label } from './generated/public/tasks/model/label';
export type { LabelFilterParameter } from './generated/public/tasks/model/labelFilterParameter';
export type { LabelLimitReachedResponse } from './generated/public/tasks/model/labelLimitReachedResponse';
export type { LabelPage } from './generated/public/tasks/model/labelPage';
export { LevelParameter } from './generated/public/tasks/model/levelParameter';
export type { ListLabelsParams } from './generated/public/tasks/model/listLabelsParams';
export type { ListMyTasksParams } from './generated/public/tasks/model/listMyTasksParams';
export type { ListSubtasksParams } from './generated/public/tasks/model/listSubtasksParams';
export type { ListTaskActivityParams } from './generated/public/tasks/model/listTaskActivityParams';
export type { ListTasksParams } from './generated/public/tasks/model/listTasksParams';
export type { MyTaskCounts } from './generated/public/tasks/model/myTaskCounts';
export type { MyTaskPage } from './generated/public/tasks/model/myTaskPage';
export { MyTaskStateParameter } from './generated/public/tasks/model/myTaskStateParameter';
export type { PriorityFilterParameter } from './generated/public/tasks/model/priorityFilterParameter';
export type { SearchParameter } from './generated/public/tasks/model/searchParameter';
export type { StatusFilterParameter } from './generated/public/tasks/model/statusFilterParameter';
export type { SubtaskCreationConflictResponse } from './generated/public/tasks/model/subtaskCreationConflictResponse';
export type { SubtaskCreationRefusedResponse } from './generated/public/tasks/model/subtaskCreationRefusedResponse';
export type { TaskArchivedResponse } from './generated/public/tasks/model/taskArchivedResponse';
export type { TaskChangeRefusedResponse } from './generated/public/tasks/model/taskChangeRefusedResponse';
export type { TaskCreationRefusedResponse } from './generated/public/tasks/model/taskCreationRefusedResponse';
export type { TaskDetail } from './generated/public/tasks/model/taskDetail';
export type { TaskGroup } from './generated/public/tasks/model/taskGroup';
export type { TaskGroupPage } from './generated/public/tasks/model/taskGroupPage';
export type { TaskNotFoundResponse } from './generated/public/tasks/model/taskNotFoundResponse';
export { TaskSortParameter } from './generated/public/tasks/model/taskSortParameter';
export type { TaskSummaryPage } from './generated/public/tasks/model/taskSummaryPage';

// openapi/public/access.yaml
export {
  AccessService,
  type ListListGrantsClientResult,
  type ListSpaceGrantsClientResult,
  type RemoveListGrantClientResult,
  type RemoveSpaceGrantClientResult,
  type SetListGrantClientResult,
  type SetSpaceGrantClientResult,
} from './generated/public/access/access/access.service';
export {
  AccessRequestsService,
  type ApproveAccessRequestClientResult,
  type CreateAccessRequestClientResult,
  type ListAccessRequestsClientResult,
  type RefuseAccessRequestClientResult,
} from './generated/public/access/access-requests/access-requests.service';
export type { AccessRequestDecidedResponse } from './generated/public/access/model/accessRequestDecidedResponse';
export type { AccessRequestNotFoundResponse } from './generated/public/access/model/accessRequestNotFoundResponse';
export type { AccessRequestPage } from './generated/public/access/model/accessRequestPage';
export type { AccessRequestRateLimitedResponse } from './generated/public/access/model/accessRequestRateLimitedResponse';
export type { GrantPage } from './generated/public/access/model/grantPage';
export type { GrantRefusedResponse } from './generated/public/access/model/grantRefusedResponse';
export type { ListAccessRequestsParams } from './generated/public/access/model/listAccessRequestsParams';
export type { ListIdFilterParameter } from './generated/public/access/model/listIdFilterParameter';
export type { ListListGrantsParams } from './generated/public/access/model/listListGrantsParams';
export type { ListSpaceGrantsParams } from './generated/public/access/model/listSpaceGrantsParams';
export type { ListWriteForbiddenResponse } from './generated/public/access/model/listWriteForbiddenResponse';
export type { OwnerUnchangeableResponse } from './generated/public/access/model/ownerUnchangeableResponse';
export type { SpaceIdFilterParameter } from './generated/public/access/model/spaceIdFilterParameter';

// openapi/public/archives.yaml
export {
  ArchivesService,
  type ArchiveListClientResult,
  type ArchiveTaskClientResult,
  type ListArchivedListsClientResult,
  type ListArchivedTasksClientResult,
  type UnarchiveListClientResult,
  type UnarchiveTaskClientResult,
} from './generated/public/archives/archives/archives.service';
export type { ArchivedListPage } from './generated/public/archives/model/archivedListPage';
export type { ArchivedTaskPage } from './generated/public/archives/model/archivedTaskPage';
export type { ListArchivedListsParams } from './generated/public/archives/model/listArchivedListsParams';
export type { ListArchivedTasksParams } from './generated/public/archives/model/listArchivedTasksParams';
export type { ListIfMatchParameter } from './generated/public/archives/model/listIfMatchParameter';
export type { TaskIfMatchParameter } from './generated/public/archives/model/taskIfMatchParameter';

// openapi/public/trash.yaml
export {
  TrashService,
  type EmptyTrashClientResult,
  type ListTrashClientResult,
  type PurgeTrashEntryClientResult,
  type RestoreTrashEntryClientResult,
  type TrashTaskClientResult,
} from './generated/public/trash/trash/trash.service';
export type { ListTrashParams } from './generated/public/trash/model/listTrashParams';
export type { TrashEntryNotFoundResponse } from './generated/public/trash/model/trashEntryNotFoundResponse';
export type { TrashEntryPage } from './generated/public/trash/model/trashEntryPage';

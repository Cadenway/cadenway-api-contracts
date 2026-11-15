/**
 * Public API of `@cadenway/api-client`: the Angular services generated from the public OpenAPI
 * documents, with the types of their parameters and results.
 *
 * One explicit export per generated declaration. `NextCursor`, which every document receives from
 * components/http.yaml, is exported once a document paginates.
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
  type VerifySignUpClientResult,
} from './generated/public/auth/auth/auth.service';
export type { AccountLockedResponse } from './generated/public/auth/model/accountLockedResponse';
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
export type { UnauthenticatedResponse } from './generated/public/auth/model/unauthenticatedResponse';
export type { UnavailableResponse } from './generated/public/auth/model/unavailableResponse';

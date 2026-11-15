# @cadenway/api-client

## 0.2.1

### Patch Changes

- d0be0f3: Declare `403 auth.csrf-rejected` on every public auth route that changes state, signed in or not, as
  the gateway checks the `Origin` and `Content-Type` of all of them; sign-in lists it beside
  `auth.email-not-verified`. The bad-request examples show `details.issues[].path` as the dotted string
  the kit emits.

## 0.2.0

### Minor Changes

- 93cf3ae: Export `AuthService`, the Angular client of the public authentication routes
  (`openapi/public/auth.yaml`), with the types of its requests, results and problems. The session
  travels in the `__Host-cw_session` cookie: the application sends its requests with credentials
  (`withCredentials`).

## 0.1.0

### Minor Changes

- bcc464d: Bootstrap both packages as empty shells. `@cadenway/contracts` declares its entry point and the
  `types/`, `validators/` and `events/` subpaths the generators fill; `@cadenway/api-client` is an
  empty Angular library. No route, event or enumeration is published yet.

# @cadenway/api-client

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

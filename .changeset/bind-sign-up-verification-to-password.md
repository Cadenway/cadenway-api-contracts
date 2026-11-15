---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Bind the sign-up verification to the password of the sign-up, so that signing up an unverified
address again with another password can no longer take over the account its owner verifies.
`POST /v1/auth/sign-up/verification` and `POST /internal/v1/auth/sign-up/verification` take a new
`SignUpVerification` body with an optional `password`, which the web application always sends:
once the code is right, a `password` that differs from the one of the latest sign-up, or a missing
one after the address was signed up more than once, answers the new
`422 auth.sign-up-replaced` (`SignUpVerificationRefusedResponse`) and the code stops working. This
deliberately refuses a request that was accepted before, a code without `password` after a repeated
sign-up, as a security fix: the schema change itself is additive. The API gateway must forward
`password` and accept `auth.sign-up-replaced` before identity-service requires `password`.
`POST /v1/auth/sign-in/code/verification` keeps `CodeVerification`. The descriptions of
`auth.code-throttled` now state that sign-up and sign-in code requests share the per-address
throttle (30 seconds between two, at most 5 in an hour), and the internal sign-up `name` states its
trimming rule.

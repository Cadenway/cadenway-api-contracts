---
'@cadenway/contracts': patch
'@cadenway/api-client': patch
---

Declare `403 auth.csrf-rejected` on every public auth route that changes state, signed in or not, as
the gateway checks the `Origin` and `Content-Type` of all of them; sign-in lists it beside
`auth.email-not-verified`. The bad-request examples show `details.issues[].path` as the dotted string
the kit emits.

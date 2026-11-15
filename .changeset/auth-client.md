---
'@cadenway/api-client': minor
---

Export `AuthService`, the Angular client of the public authentication routes
(`openapi/public/auth.yaml`), with the types of its requests, results and problems. The session
travels in the `__Host-cw_session` cookie: the application sends its requests with credentials
(`withCredentials`).

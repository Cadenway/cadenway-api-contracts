---
'@cadenway/contracts': minor
'@cadenway/api-client': minor
---

Refuse organization addresses that are first path segments of the web application. Creating an
organization with such an address, given or derived from its name, or changing to one answers
`422 organization.slug-reserved` with `details.slug`. An organization keeps a current address that
became reserved after it was chosen.

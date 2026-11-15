---
'@cadenway/contracts': minor
---

Every module of `@cadenway/contracts/events/<spec>` now exports `RESTRICTED_EVENT_NAMES` and
`RestrictedEventName`: the events whose message is marked `x-cadenway-restricted: true`, published on
`restricted.<name>` in `EVENTS_RESTRICTED`. Pass the list as `restrictedEvents` to the
`MessagingModule` of `@cadenway/nest-messaging`; it is empty for a document without restricted events.

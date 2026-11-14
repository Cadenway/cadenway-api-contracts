---
'@cadenway/contracts': patch
---

Define the problem, the pagination members and the event actor once, in `components/`, for every spec
to reference. Types, validators and shipped specs carry them as if they were written in each spec;
no import path changes.

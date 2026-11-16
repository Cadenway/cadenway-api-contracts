---
name: cw-versioning-rules
description: "Which spec changes are minor or major, how deprecation works, and how events are versioned. Load it before any non-additive change."
---

# Versioning rules

| Change | Level |
| --- | --- |
| New route, new optional field, new enumeration value consumers can ignore | minor |
| New value of a response value set | minor when the set is `x-extensible-enum`; a value added to a response `enum` is breaking for oasdiff |
| Description, example | patch |
| Removed or renamed field or route, new required input, narrowed type, changed code | major, after a deprecation in a minor |
| Incompatible event payload change, including an optional addition to a closed schema | new versioned event name |

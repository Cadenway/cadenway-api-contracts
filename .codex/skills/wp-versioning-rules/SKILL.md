---
name: wp-versioning-rules
description: "Which spec changes are minor or major, how deprecation works, and how events are versioned. Load it before any non-additive change."
---

# Versioning rules

| Change | Level |
| --- | --- |
| New route, new optional field, new enumeration value consumers can ignore | minor |
| Description, example | patch |
| Removed or renamed field or route, new required input, narrowed type, changed code | major, after a deprecation in a minor |
| Event payload change other than an added optional field | new versioned event name |

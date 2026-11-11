---
name: wp-contract-style
description: "Naming, pagination, error, id and date conventions shared by every Waypoint spec. Load it before writing or reviewing a spec."
---

# Contract style

| Concern | Rule |
| --- | --- |
| Fields | camelCase |
| Ids | strings; tasks use the space prefix (`WAY-482`) |
| Dates | ISO 8601; dates without time as `YYYY-MM-DD` |
| Lists | cursor pagination, `limit` ≤ 100 |
| Errors | `{ code, message, details? }`; `code` stable and documented |
| Partial aggregates | `partial: string[]` naming the missing parts |
| Enumerations | `StatusKey`, `StatusCategory`, `MilestoneStatusKey`, `PriorityKey`, `CancelReason`, `Recurrence` |

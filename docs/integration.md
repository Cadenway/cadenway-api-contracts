# Domain and integration

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

**Status:** This page records the target design from repository instructions and skills. Its behavior has not been verified as implemented in this snapshot.

## Change sequence

Author the contract in this repository first. After a compatible release of the generated packages, update the producing service, then gateways and listening services, then the webapp. The files and packages are planned until they exist; do not modify generated output by hand.

## Contract Style

Source: `cw-contract-style` ([Claude](../.claude/skills/cw-contract-style/SKILL.md), [Codex](../.codex/skills/cw-contract-style/SKILL.md)).

| Concern            | Rule                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| Fields             | camelCase                                                                                        |
| Ids                | strings; tasks use the space prefix (`CAD-482`)                                                  |
| Dates              | ISO 8601; dates without time as `YYYY-MM-DD`                                                     |
| Lists              | cursor pagination, `limit` ≤ 100                                                                 |
| Errors             | `{ code, message, details? }`; `code` stable and documented                                      |
| Partial aggregates | `partial: string[]` naming the missing parts                                                     |
| Enumerations       | `StatusKey`, `StatusCategory`, `MilestoneStatusKey`, `PriorityKey`, `CancelReason`, `Recurrence` |

## Versioning Rules

Source: `cw-versioning-rules` ([Claude](../.claude/skills/cw-versioning-rules/SKILL.md), [Codex](../.codex/skills/cw-versioning-rules/SKILL.md)).

| Change                                                                             | Level                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------- |
| New route, new optional field, new enumeration value consumers can ignore          | minor                                 |
| Description, example                                                               | patch                                 |
| Removed or renamed field or route, new required input, narrowed type, changed code | major, after a deprecation in a minor |
| Event payload change other than an added optional field                            | new versioned event name              |

## References

[Interactive mockup](https://claude.ai/artifact/KYRM7AnsYLiBLBLKy8i4HE), [integration guide](https://claude.ai/artifact/CpJHVCiFfF9j3KbHQ2S1Et), and [repositories and packages](https://claude.ai/artifact/BPinmYxoF3mbK8w9BMB43N). Use [AGENTS.md](../AGENTS.md) as the local source for ownership and hard limits.

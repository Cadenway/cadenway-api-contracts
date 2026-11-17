---
name: cw-quality
description: Run the local quality gate, stopping at the first failure.
---

Run the [full local gate](../../../docs/development.md#full-local-quality-gate) from this checkout. Follow its order and
stop at the first failure. Report passed, failed, not run or unavailable for each check and
explain gaps. For targeted work, use the [minimum checks](../../../AGENTS.md#commands-and-quality-gates).
Report executed test counts. Zero executed tests leave the behavior unverified despite exit success.

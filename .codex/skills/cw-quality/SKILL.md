---
name: cw-quality
description: Run the local quality gate, stopping at the first failure.
---

Run in order and stop at the first failure: `pnpm format:check`, `pnpm lint:specs`, `pnpm breaking`, `pnpm generate`, `pnpm typecheck`, `pnpm test:architecture`, `pnpm test`, `pnpm build`, `pnpm changeset status`. A missing script is reported as **not available**. End with one line per step: PASS, FAIL, not run or not available.

#!/usr/bin/env node
/**
 * Runs Vitest for the `test` script.
 *
 * pnpm forwards the `--` of `pnpm test -- <filter>` as a literal argument, and Vitest ignores
 * everything that follows it: the filter would be dropped and every spec would run. This launcher
 * removes the separator so the rest reaches Vitest as file filters and options.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const vitest = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url));
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const result = spawnSync(process.execPath, [vitest, 'run', ...args], { stdio: 'inherit' });

process.exit(result.status ?? 1);

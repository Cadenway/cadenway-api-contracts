#!/usr/bin/env node
/**
 * First step of `pnpm generate`: empties the generated trees of every root, so that the code of a
 * spec that was renamed or deleted does not stay behind. Everything in these folders is written
 * again by the steps that follow.
 */
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROOTS } from './lib/roots.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const root of ROOTS) {
  for (const folder of [root.contracts, root.client]) {
    rmSync(path.join(repository, folder), { recursive: true, force: true });
  }
}

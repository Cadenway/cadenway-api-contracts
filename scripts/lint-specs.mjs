#!/usr/bin/env node
/**
 * Lints the OpenAPI and AsyncAPI documents with Spectral (`pnpm lint:specs`), using the rules of
 * `.spectral.yaml`.
 *
 * Usage: `node scripts/lint-specs.mjs [directory...]`. Without argument it lints `openapi/` and
 * `asyncapi/`; `node scripts/lint-specs.mjs test/fixtures` lints the pipeline fixtures.
 *
 * Spectral fails on an empty file list, so the "no spec yet" case is handled here: it is a
 * success with an explicit message, not a silent pass.
 */
import path from 'node:path';

import { listSpecFiles, parseArguments, repoRoot, runTool } from './lib/specs.mjs';

const { positionals } = parseArguments(process.argv.slice(2), {});
const directories = positionals.length > 0 ? positionals : ['openapi', 'asyncapi'];

const documents = directories.flatMap((directory) => {
  const absolute = path.resolve(repoRoot, directory);
  return [...listSpecFiles(absolute, 'openapi'), ...listSpecFiles(absolute, 'asyncapi')].map(
    (relative) => path.join(absolute, relative),
  );
});
const unique = [...new Set(documents)].sort();

if (unique.length === 0) {
  console.log(`lint:specs: no spec document under ${directories.join(', ')}; nothing to lint.`);
  process.exit(0);
}

console.log(`lint:specs: linting ${unique.length} document(s) with Spectral.`);
process.exit(
  runTool('node_modules/@stoplight/spectral-cli/dist/index.js', [
    'lint',
    '--ruleset',
    path.join(repoRoot, '.spectral.yaml'),
    ...unique,
  ]),
);

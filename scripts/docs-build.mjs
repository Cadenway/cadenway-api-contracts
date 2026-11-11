#!/usr/bin/env node
/**
 * Builds the HTML reference of every OpenAPI document with Redocly (`pnpm docs:build`): one page
 * per spec, at the same relative path below the output directory.
 *
 * Usage: `node scripts/docs-build.mjs [--openapi <directory>] [--out <directory>]`. The defaults
 * are `openapi/` and `dist/docs/`.
 *
 * Without any spec the script succeeds with an explicit message and writes nothing.
 */
import path from 'node:path';

import { listSpecFiles, parseArguments, repoRoot, runTool } from './lib/specs.mjs';

const { options } = parseArguments(process.argv.slice(2), {
  openapi: 'openapi',
  out: 'dist/docs',
});
const specsDirectory = path.resolve(repoRoot, options.openapi);
const outputDirectory = path.resolve(repoRoot, options.out);

const specs = listSpecFiles(specsDirectory, 'openapi');
if (specs.length === 0) {
  console.log(`docs:build: no OpenAPI document under ${options.openapi}; nothing to build.`);
  process.exit(0);
}

for (const relative of specs) {
  const page = relative.replace(/\.(ya?ml|json)$/i, '.html');
  const status = runTool(
    'node_modules/@redocly/cli/bin/cli.js',
    ['build-docs', path.join(specsDirectory, relative), '-o', path.join(outputDirectory, page)],
    // The build is offline: no usage report, no version lookup.
    { REDOCLY_TELEMETRY: 'off', REDOCLY_SUPPRESS_UPDATE_NOTICE: 'true' },
  );
  if (status !== 0) process.exit(status);
}

console.log(`docs:build: ${specs.length} page(s) written to ${options.out}.`);

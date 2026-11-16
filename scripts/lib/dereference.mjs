import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const redocly = path.join(path.dirname(require.resolve('@redocly/cli/package.json')), 'bin/cli.js');

/** Bundles a spec using the component references from the same tree. */
export function dereference(file, cwd) {
  const run = spawnSync(
    process.execPath,
    [redocly, 'bundle', file, '--dereferenced', '--ext', 'json'],
    { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  if (run.status !== 0) {
    throw new Error(`redocly could not read ${file}:\n${run.stderr || run.stdout}`);
  }
  return JSON.parse(run.stdout);
}

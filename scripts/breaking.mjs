#!/usr/bin/env node
/**
 * `pnpm breaking`: compares the OpenAPI documents of the working tree with those of `main`, the way
 * the `breaking` job of .github/workflows/ci.yml does (oasdiff, composed mode, failure on ERR).
 *
 * - The base is `origin/main` as this checkout knows it, else the local `main`; `--base <ref>`
 *   compares with another commit. Nothing is fetched.
 * - While the base holds no OpenAPI document the comparison is skipped, like in CI.
 * - oasdiff is taken from the PATH, else run from its container image with Docker.
 * - Only OpenAPI is compared. No tool checks the events: an event changes shape under a new
 *   versioned name, and the change is reviewed (`/cw-breaking-review`).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SHARED } from './lib/roots.mjs';

// The oasdiff release the action pinned in ci.yml runs (oasdiff-action v0.1.23); move both together.
const OASDIFF_IMAGE = 'tufin/oasdiff:v1.37.0';
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = path.join(repository, '.cache/breaking');

function git(...args) {
  return spawnSync('git', args, {
    cwd: repository,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
}

function baseRef() {
  const flag = process.argv.indexOf('--base');
  if (flag !== -1) {
    const ref = process.argv[flag + 1];
    if (!ref) throw new Error('--base needs a Git reference.');
    return ref;
  }
  for (const ref of ['refs/remotes/origin/main', 'refs/heads/main']) {
    if (git('rev-parse', '--verify', '--quiet', ref).status === 0) return ref;
  }
  throw new Error('neither origin/main nor main exists in this checkout.');
}

/** Writes the specs and the shared components of a commit under .cache/breaking/base/. */
function exportBase(ref) {
  const listing = git('ls-tree', '-r', '--name-only', ref, '--', 'openapi', SHARED);
  if (listing.status !== 0) throw new Error(`git could not read ${ref}:\n${listing.stderr}`);
  const files = listing.stdout.split('\n').filter((file) => /\.ya?ml$/.test(file));
  rmSync(cache, { recursive: true, force: true });
  for (const file of files) {
    const content = git('show', `${ref}:${file}`);
    if (content.status !== 0) throw new Error(`git could not read ${ref}:${file}.`);
    const target = path.join(cache, 'base', file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content.stdout);
  }
  return files.filter((file) => file.startsWith('openapi/'));
}

/** Returns the command that runs oasdiff with the repository as working directory. */
function oasdiff() {
  if (spawnSync('oasdiff', ['--version'], { encoding: 'utf8' }).status === 0) {
    return { command: 'oasdiff', prefix: [] };
  }
  if (spawnSync('docker', ['info'], { encoding: 'utf8' }).status === 0) {
    const mount = `${repository}:/work`;
    return {
      command: 'docker',
      prefix: ['run', '--rm', '--volume', mount, '--workdir', '/work', OASDIFF_IMAGE],
    };
  }
  throw new Error(
    `oasdiff is not installed and Docker is not running. Install oasdiff (https://github.com/oasdiff/oasdiff) or start Docker, which runs ${OASDIFF_IMAGE}.`,
  );
}

function main() {
  const ref = baseRef();
  const commit = git('rev-parse', '--short', ref).stdout.trim();
  const specs = exportBase(ref);
  console.log('breaking: events are not compared by any tool; review them (/cw-breaking-review).');
  if (specs.length === 0) {
    console.log(`breaking: ${ref} (${commit}) holds no OpenAPI document, nothing to compare.`);
    return 0;
  }

  const { command, prefix } = oasdiff();
  console.log(`breaking: comparing openapi/ with ${ref} (${commit}), using ${command}.`);
  // The specs reference components/ by relative path; both trees are local files.
  const run = spawnSync(
    command,
    [
      ...prefix,
      'breaking',
      '.cache/breaking/base/openapi/**/*.yaml',
      'openapi/**/*.yaml',
      '--composed',
      '--allow-external-refs=true',
      '--fail-on',
      'ERR',
    ],
    { cwd: repository, stdio: 'inherit' },
  );
  return run.status ?? 1;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`breaking: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}

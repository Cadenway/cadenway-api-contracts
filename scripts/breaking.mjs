#!/usr/bin/env node
/**
 * `pnpm breaking`: compares the OpenAPI and AsyncAPI documents of the working tree with `main`.
 *
 * - The base is `origin/main` as this checkout knows it, else the local `main`; `--base <ref>`
 *   compares with another commit. Nothing is fetched.
 * - While the base holds no OpenAPI document the comparison is skipped, like in CI.
 * - oasdiff is taken from the PATH, else run from its container image with Docker.
 * - `--events-only` runs the AsyncAPI check without oasdiff, as on pull request CI.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { dereference } from './lib/dereference.mjs';
import { compareEventExamples, compareEvents, eventExamples } from './lib/event-compatibility.mjs';
import { renderEventsModule } from './lib/events-module.mjs';
import { SHARED } from './lib/roots.mjs';

// The oasdiff release the action pinned in ci.yml runs (oasdiff-action v0.1.23); move both together.
const OASDIFF_IMAGE = 'tufin/oasdiff:v1.37.0';
const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

/** Writes the specs and shared components of a commit to the check's temporary directory. */
function exportBase(ref, eventsOnly, cache) {
  const directories = eventsOnly ? ['asyncapi', SHARED] : ['openapi', 'asyncapi', SHARED];
  const listing = git('ls-tree', '-r', '--name-only', ref, '--', ...directories);
  if (listing.status !== 0) throw new Error(`git could not read ${ref}:\n${listing.stderr}`);
  const files = listing.stdout.split('\n').filter((file) => /\.ya?ml$/.test(file));
  for (const file of files) {
    const content = git('show', `${ref}:${file}`);
    if (content.status !== 0) throw new Error(`git could not read ${ref}:${file}.`);
    const target = path.join(cache, 'base', file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content.stdout);
  }
  return files;
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

async function loadValidators(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  const { eventSchemas } = await import(pathToFileURL(file).href);
  return eventSchemas;
}

async function checkEvents(specs, commit, cache) {
  const sources = specs.filter((file) => file.startsWith('asyncapi/'));
  const problems = [];
  for (const source of sources) {
    if (!existsSync(path.join(repository, source))) {
      problems.push(`${source}: the document with published events was removed.`);
      continue;
    }
    const previous = dereference(source, path.join(cache, 'base'));
    const next = dereference(source, repository);
    const differences = compareEvents(previous, next);
    problems.push(...differences.map((problem) => `${source}: ${problem}`));

    // Exercise authored payload examples with the previous generated validator and a fresh one.
    const previousExamples = eventExamples(previous);
    const nextExamples = eventExamples(next);
    if (differences.length > 0 || previousExamples.length + nextExamples.length === 0) continue;
    const target = source.slice('asyncapi/'.length).replace(/\.ya?ml$/, '.ts');
    const previousModule = git(
      'show',
      `${commit}:packages/contracts/src/generated/events/${target}`,
    );
    if (previousModule.status !== 0) {
      throw new Error(`Missing generated event validators for ${source} at ${commit}.`);
    }
    const [previousValidators, nextValidators] = await Promise.all([
      loadValidators(path.join(cache, 'validators/base', target), previousModule.stdout),
      loadValidators(
        path.join(cache, 'validators/head', target),
        renderEventsModule({ source, document: next }),
      ),
    ]);
    problems.push(
      ...compareEventExamples(
        { examples: previousExamples, validators: previousValidators },
        { examples: nextExamples, validators: nextValidators },
      ).map((problem) => `${source}: ${problem}`),
    );
  }

  for (const problem of problems) console.error(`breaking: ${problem}`);
  if (problems.length > 0) return false;
  console.log(
    `breaking: ${sources.length} AsyncAPI documents compatible with ${commit.slice(0, 12)}.`,
  );
  return true;
}

async function main(cache) {
  const ref = baseRef();
  const resolved = git('rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`);
  if (resolved.status !== 0) throw new Error(`could not resolve the base commit ${ref}.`);
  const commit = resolved.stdout.trim();
  const eventsOnly = process.argv.includes('--events-only');
  const specs = exportBase(commit, eventsOnly, cache);
  if (!(await checkEvents(specs, commit, cache))) return 1;
  if (eventsOnly) return 0;
  if (!specs.some((source) => source.startsWith('openapi/'))) {
    console.log(`breaking: ${ref} holds no OpenAPI document, nothing to compare.`);
    return 0;
  }

  const { command, prefix } = oasdiff();
  console.log(`breaking: comparing openapi/ with ${ref} (${commit}), using ${command}.`);
  // The specs reference components/ by relative path; both trees are local files.
  const baseGlob =
    path.relative(repository, cache).split(path.sep).join('/') + '/base/openapi/**/*.yaml';
  const run = spawnSync(
    command,
    [
      ...prefix,
      'breaking',
      baseGlob,
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

async function run() {
  const root = path.join(repository, '.cache');
  mkdirSync(root, { recursive: true });
  const resolvedRoot = realpathSync(root);
  if (path.relative(realpathSync(repository), resolvedRoot) !== '.cache') {
    throw new Error('the check cache must be inside the repository.');
  }
  const cache = mkdtempSync(path.join(resolvedRoot, 'breaking-'));
  try {
    return await main(cache);
  } finally {
    if (path.dirname(realpathSync(cache)) === resolvedRoot) {
      rmSync(cache, { recursive: true, force: true });
    }
  }
}

try {
  process.exitCode = await run();
} catch (error) {
  console.error(`breaking: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}

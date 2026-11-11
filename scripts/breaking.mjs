#!/usr/bin/env node
/**
 * Detects breaking changes of the OpenAPI documents (`pnpm breaking`): compares `openapi/` at a
 * base Git ref with the working tree, one spec file at a time, with oasdiff.
 *
 * Usage: `node scripts/breaking.mjs [--base <ref>]`. The default base is `origin/main`, then the
 * local `main` when the remote branch is unknown (a checkout without remote).
 *
 * oasdiff runs from its Docker image: the `oasdiff` package on npm is a placeholder, not the tool.
 * Docker is started without a shell so Windows paths reach `--volume` unchanged.
 *
 * Outcomes:
 * - no spec on either side: "no baseline", success;
 * - a spec only in the working tree: new, nothing to compare, success;
 * - a spec only in the base: its routes are gone, failure;
 * - a spec on both sides: failure when oasdiff reports a change of level ERR.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { isRootDocument, listSpecFiles, parseArguments, repoRoot } from './lib/specs.mjs';

/**
 * Image of oasdiff, pinned by tag and by the digest of its multi-platform index (linux/amd64 and
 * linux/arm64). Check a new tag with `docker buildx imagetools inspect <image>` before pinning it:
 * a tag whose index lists no platform cannot run.
 */
const OASDIFF_IMAGE =
  'tufin/oasdiff:v1.37.0@sha256:ff02af37a254b5199b9d72e7bba93dae5837a9119d59459168d1398893b47aea';

const SPECS_FOLDER = 'openapi';

/** Runs Git in the repository and returns its result without throwing. */
function git(args, encoding = 'utf8') {
  return spawnSync('git', args, { cwd: repoRoot, encoding, maxBuffer: 64 * 1024 * 1024 });
}

/** Tells whether a ref names a commit in this checkout. */
function refExists(ref) {
  return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]).status === 0;
}

/** Lists the files of `openapi/` at a ref, relative to that folder. */
function listFilesAtRef(ref) {
  const result = git(['ls-tree', '-r', '--name-only', '-z', ref, '--', SPECS_FOLDER]);
  if (result.status !== 0) throw new Error(`git ls-tree failed for ${ref}: ${result.stderr}`);
  return result.stdout
    .split('\0')
    .filter(Boolean)
    .map((file) => file.slice(SPECS_FOLDER.length + 1))
    .sort();
}

/**
 * Writes `openapi/` as it is at a ref into a directory, fragments included so relative `$ref`s
 * still resolve, and returns the root documents among them.
 */
function exportBase(ref, directory) {
  const specs = [];
  for (const relative of listFilesAtRef(ref)) {
    const result = git(['show', `${ref}:${SPECS_FOLDER}/${relative}`], 'buffer');
    if (result.status !== 0) throw new Error(`git show failed for ${relative} at ${ref}`);
    const target = path.join(directory, relative);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, result.stdout);
    if (
      /\.(ya?ml|json)$/i.test(relative) &&
      isRootDocument(relative, result.stdout.toString('utf8'), 'openapi')
    ) {
      specs.push(relative);
    }
  }
  return specs;
}

/** Compares one spec of the base with the same file of the working tree; returns the exit status. */
function compare(baseDirectory, headDirectory, relative) {
  const result = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '--volume',
      `${baseDirectory}:/base:ro`,
      '--volume',
      `${headDirectory}:/head:ro`,
      OASDIFF_IMAGE,
      'breaking',
      `/base/${relative}`,
      `/head/${relative}`,
      '--fail-on',
      'ERR',
    ],
    { stdio: 'inherit' },
  );
  if (result.error) {
    console.error(`breaking: Docker could not be started (${result.error.message}).`);
    return 1;
  }
  return result.status ?? 1;
}

function main() {
  const { options } = parseArguments(process.argv.slice(2), { base: '' });
  const candidates = options.base ? [options.base] : ['origin/main', 'main'];
  const baseRef = candidates.find(refExists);

  const headDirectory = path.join(repoRoot, SPECS_FOLDER);
  const headSpecs = listSpecFiles(headDirectory, 'openapi');

  if (!baseRef) {
    if (headSpecs.length === 0) {
      console.log(`breaking: no baseline (no ref ${candidates.join(' or ')}, no spec to compare).`);
      return 0;
    }
    // Passing here would hide every breaking change of a shallow or detached checkout.
    console.error(
      `breaking: cannot find ${candidates.join(' or ')}; fetch the base branch (in CI: fetch-depth 0).`,
    );
    return 1;
  }

  const baseDirectory = mkdtempSync(path.join(tmpdir(), 'wp-breaking-'));
  try {
    const baseSpecs = exportBase(baseRef, baseDirectory);

    if (baseSpecs.length === 0 && headSpecs.length === 0) {
      console.log(`breaking: no baseline (no OpenAPI spec in ${baseRef} or in the working tree).`);
      return 0;
    }

    let failures = 0;
    for (const relative of headSpecs.filter((spec) => !baseSpecs.includes(spec))) {
      console.log(`breaking: ${SPECS_FOLDER}/${relative} is new; nothing to compare.`);
    }
    for (const relative of baseSpecs) {
      if (!headSpecs.includes(relative)) {
        console.error(`breaking: ${SPECS_FOLDER}/${relative} was removed; its routes are gone.`);
        failures += 1;
        continue;
      }
      console.log(`breaking: comparing ${SPECS_FOLDER}/${relative} with ${baseRef}.`);
      if (compare(baseDirectory, headDirectory, relative) !== 0) failures += 1;
    }

    if (failures > 0) {
      console.error(`breaking: ${failures} spec(s) with breaking changes against ${baseRef}.`);
      return 1;
    }
    console.log(`breaking: no breaking change against ${baseRef}.`);
    return 0;
  } finally {
    rmSync(baseDirectory, { recursive: true, force: true });
  }
}

process.exit(main());

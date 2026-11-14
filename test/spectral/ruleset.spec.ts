import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The specs of this repository do not exist yet, so nothing else proves that the Cadenway rules of
// .spectral.yaml fire: test/spectral/valid/ must pass all of them, and each document of
// test/spectral/invalid/ must be reported with exactly the rules its comments name.

/**
 * Interface Finding
 *
 * @description
 * Diagnostic returned by the Spectral CLI.
 */
interface Finding {
  // #region Properties
  /**
   * Property code
   *
   * @description
   * Identifier of the rule that reported the finding.
   *
   * @type {string}
   * @readonly
   */
  readonly code: string;

  /**
   * Property severity
   *
   * @description
   * Spectral severity: 0 error, 1 warning, 2 information, 3 hint.
   *
   * @type {number}
   * @readonly
   */
  readonly severity: number;
  // #endregion
}

/**
 * Constant require
 *
 * @description
 * CommonJS resolver relative to this test module.
 *
 * @type {ReturnType<typeof createRequire>}
 */
const require: ReturnType<typeof createRequire> = createRequire(import.meta.url);
/**
 * Constant cliPackage
 *
 * @description
 * Location of the installed Spectral CLI manifest.
 *
 * @type {string}
 */
const cliPackage: string = require.resolve('@stoplight/spectral-cli/package.json');
/**
 * Constant cli
 *
 * @description
 * Executable entry point of the installed Spectral CLI.
 *
 * @type {string}
 */
const cli: string = join(dirname(cliPackage), 'dist', 'index.js');

/**
 * Function lint
 *
 * @description
 * Runs Spectral on a document with the repository ruleset.
 *
 * @param {string} document - Document path passed to Spectral.
 * @returns {Finding[]} Findings reported by Spectral.
 */
function lint(document: string): Finding[] {
  const run: SpawnSyncReturns<string> = spawnSync(
    process.execPath,
    [cli, 'lint', '--format', 'json', '--quiet', document],
    {
      encoding: 'utf8',
    },
  );
  // Exit code 1 means findings at error level; anything else is a crash of the linter.
  if (run.status !== 0 && run.status !== 1) {
    throw new Error(`spectral exited with ${String(run.status)}: ${run.stderr}`);
  }
  return JSON.parse(run.stdout) as Finding[];
}

/**
 * Function cadenwayCodes
 *
 * @description
 * Returns each Cadenway rule a document breaks, sorted once.
 *
 * @param {string} document - Document path to inspect.
 * @returns {string[]} Sorted rule identifiers.
 */
function cadenwayCodes(document: string): string[] {
  const codes: string[] = lint(document)
    .map((finding) => finding.code)
    .filter((code) => code.startsWith('cadenway-'));
  return [...new Set(codes)].sort();
}

/**
 * Constant TIMEOUT
 *
 * @description
 * Maximum duration of a Spectral process test, in milliseconds.
 *
 * @type {number}
 */
const TIMEOUT: number = 60_000;

describe('Spectral ruleset', () => {
  it.each([
    'test/spectral/valid/openapi/public/tasks.yaml',
    'test/spectral/valid/openapi/internal/task-service.yaml',
    'test/spectral/valid/asyncapi/task-service.yaml',
  ])(
    'accepts %s',
    (document) => {
      const findings: Finding[] = lint(document);

      expect(findings.filter((finding) => finding.severity === 0)).toEqual([]);
      expect(findings.filter((finding) => finding.code.startsWith('cadenway-'))).toEqual([]);
    },
    TIMEOUT,
  );

  it.each([
    [
      'test/spectral/invalid/openapi/public/style.yaml',
      [
        'cadenway-error-problem-json',
        'cadenway-error-status',
        'cadenway-openapi-no-dynamic-ref',
        'cadenway-openapi-no-path-items-component',
        'cadenway-pagination-cursor',
        'cadenway-pagination-limit',
        'cadenway-pagination-no-offset',
        'cadenway-path-kebab-case',
        'cadenway-path-no-organization',
        'cadenway-path-plural-collection',
        'cadenway-path-prefix-public',
        'cadenway-problem-schema',
      ],
    ],
    ['test/spectral/invalid/openapi/public/version.yaml', ['cadenway-openapi-version']],
    ['test/spectral/invalid/openapi/internal/prefix.yaml', ['cadenway-path-prefix-internal']],
    [
      'test/spectral/invalid/asyncapi/events.yaml',
      ['cadenway-event-channel-address', 'cadenway-event-name', 'cadenway-event-payload'],
    ],
    ['test/spectral/invalid/asyncapi/version.yaml', ['cadenway-asyncapi-version']],
  ])(
    'reports %s',
    (document, expected) => {
      expect(cadenwayCodes(document)).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'keeps the plural check a warning: a pattern cannot tell an irregular plural',
    () => {
      const plural: Finding[] = lint('test/spectral/invalid/openapi/public/style.yaml').filter(
        (finding) => finding.code === 'cadenway-path-plural-collection',
      );

      expect(plural.map((finding) => finding.severity)).toEqual([1]);
    },
    TIMEOUT,
  );
});

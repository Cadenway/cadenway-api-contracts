import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The specs of this repository do not exist yet, so nothing else proves that the Cadenway rules of
// redocly.yaml fire: test/redocly/valid/ must pass all of them, and each document of
// test/redocly/invalid/ must be reported with exactly the rules its comments name.

/**
 * Interface Finding
 *
 * @description
 * Diagnostic returned by the Redocly CLI.
 */
interface Finding {
  // #region Properties
  /**
   * Property ruleId
   *
   * @description
   * Identifier of the rule that reported the finding.
   *
   * @type {string}
   * @readonly
   */
  readonly ruleId: string;

  /**
   * Property severity
   *
   * @description
   * Severity reported by Redocly.
   *
   * @type {'error' | 'warn'}
   * @readonly
   */
  readonly severity: 'error' | 'warn';

  /**
   * Property location
   *
   * @description
   * Source locations associated with the diagnostic.
   *
   * @type {readonly { readonly pointer: string }[]}
   * @readonly
   */
  readonly location: readonly { readonly pointer: string }[];
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
 * Location of the installed Redocly CLI manifest.
 *
 * @type {string}
 */
const cliPackage: string = require.resolve('@redocly/cli/package.json');
/**
 * Constant cli
 *
 * @description
 * Executable entry point of the installed Redocly CLI.
 *
 * @type {string}
 */
const cli: string = join(dirname(cliPackage), 'bin', 'cli.js');

/**
 * Function lint
 *
 * @description
 * Runs Redocly on a document with the repository ruleset.
 *
 * @param {string} document - Document path passed to Redocly.
 * @returns {Finding[]} Findings reported by Redocly.
 */
function lint(document: string): Finding[] {
  const run: SpawnSyncReturns<string> = spawnSync(
    process.execPath,
    [cli, 'lint', '--format', 'json', document],
    {
      encoding: 'utf8',
    },
  );
  // Exit code 1 means findings at error level; anything else is a crash of the linter.
  if (run.status !== 0 && run.status !== 1) {
    throw new Error(`redocly exited with ${String(run.status)}: ${run.stderr}`);
  }
  return (JSON.parse(run.stdout) as { problems: Finding[] }).problems;
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
    .map((finding) => finding.ruleId)
    .filter((code) => code.startsWith('cadenway/'));
  return [...new Set(codes)].sort();
}

/**
 * Constant TIMEOUT
 *
 * @description
 * Maximum duration of a Redocly process test, in milliseconds.
 *
 * @type {number}
 */
const TIMEOUT: number = 60_000;

describe('Redocly ruleset', () => {
  it(
    'checks the standard operation identifier rule',
    () => {
      const findings: Finding[] = lint(
        'test/redocly/references/openapi/public/missing-operation-id.yaml',
      );
      expect(findings.map((finding) => finding.ruleId)).toContain('operation-operationId');
    },
    TIMEOUT,
  );

  it(
    'locates path diagnostics on the affected path',
    () => {
      const findings: Finding[] = lint('test/redocly/invalid/openapi/public/style.yaml');
      const finding: Finding | undefined = findings.find(
        (item) => item.ruleId === 'cadenway/path-kebab-case',
      );
      expect(finding?.location[0]?.pointer).toBe('#/paths/~1v1~1task_items~1{TaskId}');
    },
    TIMEOUT,
  );

  it(
    'reports malformed event payloads without crashing',
    () => {
      expect(cadenwayCodes('test/redocly/references/asyncapi/malformed-payload.yaml')).toContain(
        'cadenway/event-payload',
      );
    },
    TIMEOUT,
  );

  it(
    'reports dynamic references inside external schemas',
    () => {
      expect(cadenwayCodes('test/redocly/references/openapi/public/external.yaml')).toContain(
        'cadenway/openapi-no-dynamic-ref',
      );
    },
    TIMEOUT,
  );

  it.each([
    'test/redocly/valid/openapi/public/tasks.yaml',
    'test/redocly/valid/openapi/internal/task-service.yaml',
    'test/redocly/valid/asyncapi/task-service.yaml',
  ])(
    'accepts %s',
    (document) => {
      const findings: Finding[] = lint(document);

      expect(findings.filter((finding) => finding.severity === 'error')).toEqual([]);
      expect(findings.filter((finding) => finding.ruleId.startsWith('cadenway/'))).toEqual([]);
    },
    TIMEOUT,
  );

  it.each([
    [
      'test/redocly/invalid/openapi/public/style.yaml',
      [
        'cadenway/error-problem-json',
        'cadenway/error-status',
        'cadenway/openapi-no-dynamic-ref',
        'cadenway/openapi-no-path-items-component',
        'cadenway/pagination-cursor',
        'cadenway/pagination-limit',
        'cadenway/pagination-no-offset',
        'cadenway/path-kebab-case',
        'cadenway/path-no-organization',
        'cadenway/path-plural-collection',
        'cadenway/path-prefix-public',
        'cadenway/problem-schema',
      ],
    ],
    ['test/redocly/invalid/openapi/public/version.yaml', ['cadenway/openapi-version']],
    ['test/redocly/invalid/openapi/internal/prefix.yaml', ['cadenway/path-prefix-internal']],
    [
      'test/redocly/invalid/asyncapi/events.yaml',
      ['cadenway/event-channel-address', 'cadenway/event-name', 'cadenway/event-payload'],
    ],
    ['test/redocly/invalid/asyncapi/version.yaml', ['cadenway/asyncapi-version']],
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
      const plural: Finding[] = lint('test/redocly/invalid/openapi/public/style.yaml').filter(
        (finding) => finding.ruleId === 'cadenway/path-plural-collection',
      );

      expect(plural.map((finding) => finding.severity)).toEqual(['warn']);
    },
    TIMEOUT,
  );
});

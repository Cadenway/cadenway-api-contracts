import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The specs of this repository pass the rules without proving that they fire: tests/redocly/valid/
// and the specs must pass all of them without a warning, and each document of
// tests/redocly/invalid/ must be reported with exactly the rules its comments name.
// The documents of tests/redocly/valid/ take the problem, the pagination members and the actor from
// components/, like a real spec: they also prove that the rules read through those references.

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
    'checks QUERY authorization and JSON pagination',
    () => {
      expect(cadenwayCodes('tests/redocly/references/openapi/public/invalid-query.yaml')).toEqual(
        expect.arrayContaining([
          'cadenway/pagination-cursor',
          'cadenway/pagination-limit',
          'cadenway/pagination-no-offset',
          'cadenway/security-declared',
        ]),
      );
    },
    TIMEOUT,
  );

  it(
    'accepts a nullable cursor schema referenced from a page',
    () => {
      expect(
        cadenwayCodes('tests/redocly/references/openapi/public/cursor-ref.yaml'),
      ).not.toContain('cadenway/pagination-cursor');
    },
    TIMEOUT,
  );

  it(
    'checks the standard operation identifier rule',
    () => {
      const findings: Finding[] = lint(
        'tests/redocly/references/openapi/public/missing-operation-id.yaml',
      );
      expect(findings.map((finding) => finding.ruleId)).toContain('operation-operationId');
    },
    TIMEOUT,
  );

  it(
    'locates path diagnostics on the affected path',
    () => {
      const findings: Finding[] = lint('tests/redocly/invalid/openapi/public/style.yaml');
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
      expect(cadenwayCodes('tests/redocly/references/asyncapi/malformed-payload.yaml')).toContain(
        'cadenway/event-payload',
      );
    },
    TIMEOUT,
  );

  it(
    'reports dynamic references inside external schemas',
    () => {
      expect(cadenwayCodes('tests/redocly/references/openapi/public/external.yaml')).toContain(
        'cadenway/openapi-no-dynamic-ref',
      );
    },
    TIMEOUT,
  );

  it(
    'follows a reference written inside a shared component from the file that holds it',
    () => {
      expect(cadenwayCodes('tests/redocly/references/openapi/public/nested-external.yaml')).toEqual(
        ['cadenway/problem-schema'],
      );
    },
    TIMEOUT,
  );

  it.each([
    'tests/redocly/valid/openapi/public/tasks.yaml',
    'tests/redocly/valid/openapi/internal/task-service.yaml',
    'tests/redocly/valid/asyncapi/task-service.yaml',
    'tests/redocly/valid/asyncapi/identity-service.yaml',
    'components/http.yaml',
    'components/events.yaml',
    'openapi/public/auth.yaml',
    'openapi/public/organizations.yaml',
    'openapi/public/members.yaml',
    'openapi/public/api-tokens.yaml',
    'openapi/internal/identity-service.yaml',
    'openapi/internal/organization-service.yaml',
    'asyncapi/identity-service.yaml',
    'asyncapi/organization-service.yaml',
  ])(
    'accepts %s',
    (document) => {
      const findings: Finding[] = lint(document);

      expect(findings.filter((finding) => finding.severity === 'error')).toEqual([]);
      expect(findings.filter((finding) => finding.severity === 'warn')).toEqual([]);
      expect(findings.filter((finding) => finding.ruleId.startsWith('cadenway/'))).toEqual([]);
    },
    TIMEOUT,
  );

  it.each([
    [
      'tests/redocly/invalid/openapi/public/style.yaml',
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
        'cadenway/security-declared',
        'cadenway/security-scopes',
      ],
    ],
    [
      'tests/redocly/invalid/openapi/public/security.yaml',
      ['cadenway/security-declared', 'cadenway/security-scopes'],
    ],
    ['tests/redocly/invalid/openapi/public/version.yaml', ['cadenway/openapi-version']],
    ['tests/redocly/invalid/openapi/internal/prefix.yaml', ['cadenway/path-prefix-internal']],
    [
      'tests/redocly/invalid/asyncapi/events.yaml',
      ['cadenway/event-channel-address', 'cadenway/event-name', 'cadenway/event-payload'],
    ],
    ['tests/redocly/invalid/asyncapi/version.yaml', ['cadenway/asyncapi-version']],
    ['tests/redocly/invalid/asyncapi/restricted.yaml', ['cadenway/event-channel-address']],
  ])(
    'reports %s',
    (document, expected) => {
      expect(cadenwayCodes(document)).toEqual(expected);
    },
    TIMEOUT,
  );

  it(
    'accepts a restricted channel only for restricted messages that it names',
    () => {
      const pointers: string[] = lint('tests/redocly/invalid/asyncapi/restricted.yaml')
        .filter((finding) => finding.ruleId === 'cadenway/event-channel-address')
        .map((finding) => finding.location[0]?.pointer ?? '');

      expect(pointers.sort()).toEqual([
        '#/channels/codeOnEvents',
        '#/channels/mixed',
        '#/channels/notBoolean',
        '#/channels/otherName',
        '#/channels/plainOnRestricted',
      ]);
    },
    TIMEOUT,
  );

  it(
    'reports each security check of a public operation where it fails',
    () => {
      const pointers: string[] = lint('tests/redocly/invalid/openapi/public/security.yaml')
        .filter((finding) => finding.ruleId.startsWith('cadenway/security-'))
        .map((finding) => `${finding.ruleId} ${finding.location[0]?.pointer ?? ''}`);

      expect(pointers.sort()).toEqual([
        'cadenway/security-declared #/paths/~1v1~1no-security/get',
        'cadenway/security-scopes #/components/schemas/ApiTokenScope',
        'cadenway/security-scopes #/paths/~1v1~1combined/get/security',
        'cadenway/security-scopes #/paths/~1v1~1combined/get/security/0',
        'cadenway/security-scopes #/paths/~1v1~1cookie-scope/get/security/0',
        'cadenway/security-scopes #/paths/~1v1~1duplicate-scope/get/security/1',
        'cadenway/security-scopes #/paths/~1v1~1empty-token/get/security/1',
        'cadenway/security-scopes #/paths/~1v1~1token-only/get/security',
        'cadenway/security-scopes #/paths/~1v1~1unknown-scheme/get/security/0',
        'cadenway/security-scopes #/paths/~1v1~1unknown-scope/get/security/1',
      ]);
    },
    TIMEOUT,
  );

  it(
    'keeps the plural check a warning: a pattern cannot tell an irregular plural',
    () => {
      const plural: Finding[] = lint('tests/redocly/invalid/openapi/public/style.yaml').filter(
        (finding) => finding.ruleId === 'cadenway/path-plural-collection',
      );

      expect(plural.map((finding) => finding.severity)).toEqual(['warn']);
    },
    TIMEOUT,
  );
});

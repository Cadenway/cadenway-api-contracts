import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

// The specs of this repository do not exist yet, so nothing else proves that the Cadenway rules of
// .spectral.yaml fire: test/spectral/valid/ must pass all of them, and each document of
// test/spectral/invalid/ must be reported with exactly the rules its comments name.

interface Finding {
  readonly code: string;
  /** Spectral severity: 0 error, 1 warning, 2 information, 3 hint. */
  readonly severity: number;
}

const require = createRequire(import.meta.url);
const cliPackage = require.resolve('@stoplight/spectral-cli/package.json');
const cli = join(dirname(cliPackage), 'dist', 'index.js');

/** Runs the Spectral CLI on one document, with the ruleset of the repository root. */
function lint(document: string): Finding[] {
  const run = spawnSync(process.execPath, [cli, 'lint', '--format', 'json', '--quiet', document], {
    encoding: 'utf8',
  });
  // Exit code 1 means findings at error level; anything else is a crash of the linter.
  if (run.status !== 0 && run.status !== 1) {
    throw new Error(`spectral exited with ${String(run.status)}: ${run.stderr}`);
  }
  return JSON.parse(run.stdout) as Finding[];
}

/** The Cadenway rules a document breaks, sorted, each once. */
function cadenwayCodes(document: string): string[] {
  const codes = lint(document)
    .map((finding) => finding.code)
    .filter((code) => code.startsWith('cadenway-'));
  return [...new Set(codes)].sort();
}

const TIMEOUT = 60_000;

describe('Spectral ruleset', () => {
  it.each([
    'test/spectral/valid/openapi/public/tasks.yaml',
    'test/spectral/valid/openapi/internal/task-service.yaml',
    'test/spectral/valid/asyncapi/task-service.yaml',
  ])(
    'accepts %s',
    (document) => {
      const findings = lint(document);

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
      const plural = lint('test/spectral/invalid/openapi/public/style.yaml').filter(
        (finding) => finding.code === 'cadenway-path-plural-collection',
      );

      expect(plural.map((finding) => finding.severity)).toEqual([1]);
    },
    TIMEOUT,
  );
});

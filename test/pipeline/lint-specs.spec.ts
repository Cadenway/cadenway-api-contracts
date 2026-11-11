import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { createWorkspace, runNode } from './support';

const workspace = createWorkspace();

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
});

describe('lint:specs', () => {
  it('accepts the OpenAPI and AsyncAPI fixtures', () => {
    const result = runNode('scripts/lint-specs.mjs', ['test/fixtures']);

    expect(result.output).toContain('linting 4 document(s)');
    expect(result.output).toContain('0 errors, 0 warnings');
    expect(result.status).toBe(0);
  });

  it('refuses an OpenAPI document that breaks a rule of the ruleset', () => {
    const directory = path.join(workspace, 'broken');
    mkdirSync(directory);
    // A path parameter that no operation declares: `path-params`, an error of spectral:oas.
    writeFileSync(
      path.join(directory, 'broken.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Broken fixture',
        '  version: 1.0.0',
        'paths:',
        '  /widgets/{widgetId}:',
        '    get:',
        '      operationId: getWidget',
        '      responses:',
        "        '200':",
        '          description: The widget.',
        '',
      ].join('\n'),
    );

    const result = runNode('scripts/lint-specs.mjs', [directory]);

    expect(result.output).toContain('path-params');
    expect(result.status).not.toBe(0);
  });

  it('succeeds with an explicit message when there is no spec', () => {
    const directory = path.join(workspace, 'empty');
    mkdirSync(directory);

    const result = runNode('scripts/lint-specs.mjs', [directory]);

    expect(result.output).toContain('nothing to lint');
    expect(result.status).toBe(0);
  });
});

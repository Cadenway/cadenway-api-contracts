import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { generate } from 'orval';
import { expect, it } from 'vitest';

it('generates an Angular HTTP resource for a QUERY body', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'cadenway-query-resource-'));
  const target = path.join(directory, 'tasks.ts');
  try {
    await generate({
      input: {
        target: 'tests/redocly/valid/openapi/public/tasks.yaml',
        parserOptions: { externalRefs: { allow: ['../../../../../components/http.yaml'] } },
      },
      output: {
        client: 'angular',
        target,
        override: { angular: { retrievalClient: 'httpResource' } },
      },
    });
    const result = readFileSync(target, 'utf8');
    expect(result).toMatch(/method:\s*['"]QUERY['"]/);
    expect(result).toMatch(/body:/);
    expect(result).toContain('httpResource');
  } finally {
    assert.equal(path.dirname(realpathSync(directory)), realpathSync(tmpdir()));
    rmSync(directory, { recursive: true, force: true });
  }
}, 60_000);

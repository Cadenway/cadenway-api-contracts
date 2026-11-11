import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { createWorkspace, listTree, runNode } from './support';

const workspace = createWorkspace();

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
});

describe('docs:build', () => {
  it('writes one page per OpenAPI fixture, at the path of its spec', () => {
    const out = path.join(workspace, 'docs');

    const result = runNode('scripts/docs-build.mjs', [
      '--openapi',
      'test/fixtures/openapi',
      '--out',
      out,
    ]);

    expect(result.status, result.output).toBe(0);
    expect(listTree(out)).toEqual([
      'internal/widget-service.html',
      'public/gadgets.html',
      'public/widgets.html',
    ]);
    expect(readFileSync(path.join(out, 'public', 'widgets.html'), 'utf8')).toContain(
      'Widgets fixture',
    );
  });

  it('succeeds with an explicit message when there is no spec', () => {
    const empty = path.join(workspace, 'empty');
    mkdirSync(empty);
    const out = path.join(workspace, 'no-docs');

    const result = runNode('scripts/docs-build.mjs', ['--openapi', empty, '--out', out]);

    expect(result.output).toContain('nothing to build');
    expect(result.status).toBe(0);
    expect(listTree(out)).toEqual([]);
  });
});

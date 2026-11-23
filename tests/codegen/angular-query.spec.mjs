import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

function loadService(file, name, query) {
  const source = readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { experimentalDecorators: true, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  const require = (dependency) => {
    if (dependency === '@angular/common/http') return { HttpClient: class HttpClient {} };
    if (dependency === '@angular/core')
      return {
        Injectable: () => (target) => target,
        Service: () => (target) => target,
        inject: () => ({ query }),
      };
    throw new Error(`Unexpected dependency ${dependency}`);
  };
  runInNewContext(output, { exports, require });
  return new exports[name]();
}

describe('generated Angular QUERY client', () => {
  it.each(['body', 'events', 'response'])('sends the JSON body with observe %s', (observe) => {
    const query = vi.fn();
    const service = loadService(
      'tests/codegen/generated/api-client/public/tasks/tasks/tasks.service.ts',
      'TasksService',
      query,
    );
    const body = { cursor: 'next', limit: 10 };

    service.queryTasks(body, { observe });

    expect(query).toHaveBeenCalledWith('/v1/tasks', body, { observe });
  });

  it.each(['body', 'events', 'response'])(
    'reads a CSV QUERY as text with observe %s',
    (observe) => {
      const csv = '"Identifiant";"Nom"\n"CAD-482";"Tâche"';
      const query = vi.fn((_url, _body, options) =>
        options.responseType === 'text' ? csv : JSON.parse(csv),
      );
      const service = loadService(
        'packages/api-client/src/generated/public/lists/lists/lists.service.ts',
        'ListsService',
        query,
      );
      const body = { status: ['progress', 'review'] };

      expect(service.queryExportListTasks('list-id', body, { observe })).toBe(csv);
      expect(query).toHaveBeenCalledWith('/v1/lists/list-id/tasks/export', body, {
        observe,
        responseType: 'text',
      });
    },
  );
});

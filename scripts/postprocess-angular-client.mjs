/** Select text decoding for generated HTTP QUERY operations with text responses. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { rewriteAngularQueryCalls } from './lib/angular-query-client.mjs';
import { dereference } from './lib/dereference.mjs';
import { ROOTS, listYaml } from './lib/roots.mjs';

for (const root of ROOTS) {
  const textOperations = new Set();
  for (const spec of listYaml(root.openapi).filter((name) => name.startsWith('public/'))) {
    const document = dereference(`${root.openapi}/${spec}.yaml`, process.cwd());
    for (const item of Object.values(document.paths ?? {})) {
      const operation = item.query;
      if (!operation) continue;
      const types = Object.keys(operation.responses?.['200']?.content ?? {});
      if (types.length > 0 && types.every((type) => type.startsWith('text/'))) {
        textOperations.add(operation.operationId);
      }
    }
  }
  for (const entry of readdirSync(root.client, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.service.ts')) continue;
    const file = path.join(entry.parentPath, entry.name);
    const original = readFileSync(file, 'utf8');
    const rewritten = rewriteAngularQueryCalls(original, file, textOperations);
    if (rewritten !== original) writeFileSync(file, rewritten);
  }
}

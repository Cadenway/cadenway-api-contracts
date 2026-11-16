#!/usr/bin/env node
/**
 * `pnpm generate:events`: writes, for every AsyncAPI document, the module of its events (names,
 * payload types, zod validators) under `generated/events/` of its root (scripts/lib/roots.mjs).
 *
 * Redocly reads each document and resolves its references, the ones to components/ included; the
 * conversion itself is scripts/lib/events-module.mjs. The folder is owned by this script: a module
 * whose document is gone is removed.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dereference } from './lib/dereference.mjs';
import { renderEventsModule } from './lib/events-module.mjs';
import { ROOTS, listYaml } from './lib/roots.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let failed = false;
for (const root of ROOTS) {
  const output = path.join(repository, root.contracts, 'events');
  const specs = listYaml(path.join(repository, root.asyncapi));
  const written = new Set();

  for (const spec of specs) {
    const source = `${root.asyncapi}/${spec}.yaml`;
    try {
      const module = renderEventsModule({ source, document: dereference(source, repository) });
      const target = path.join(output, `${spec}.ts`);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, module);
      written.add(path.normalize(target));
      console.log(`events: ${source} -> ${root.contracts}/events/${spec}.ts`);
    } catch (error) {
      failed = true;
      console.error(`events: ${source}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (existsSync(output)) {
    for (const file of readdirSync(output, { recursive: true, encoding: 'utf8' })) {
      const stale = path.join(output, file);
      if (file.endsWith('.ts') && !written.has(path.normalize(stale))) rmSync(stale);
    }
  }
}

process.exitCode = failed ? 1 : 0;

import { existsSync, readdirSync } from 'node:fs';

import { defineConfig } from 'orval';

type Entries = Parameters<typeof defineConfig>[0];

/** Lists the spec documents of a folder as paths below it, without extension (`public/tasks`). */
function listSpecs(folder: string): string[] {
  if (!existsSync(folder)) {
    return [];
  }
  return readdirSync(folder, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => file.replaceAll('\\', '/').replace(/\.ya?ml$/, ''))
    .sort();
}

// One entry per document, discovered here so that adding a spec needs no change in this file:
// - every document of openapi/ gives its zod validators to @waypoint/contracts;
// - a document of openapi/public also gives its Angular services to @waypoint/api-client, the one
//   surface the applications call.
const entries: Record<string, unknown> = {};

for (const spec of listSpecs('openapi')) {
  const id = spec.replaceAll('/', '-');
  const input = `openapi/${spec}.yaml`;

  entries[`${id}-validators`] = {
    input,
    output: {
      client: 'zod',
      mode: 'single',
      target: `packages/contracts/src/generated/validators/${spec}.ts`,
    },
  };

  if (spec.startsWith('public/')) {
    entries[`${id}-client`] = {
      input,
      output: {
        client: 'angular',
        mode: 'tags-split',
        target: `packages/api-client/src/generated/${spec}`,
        schemas: `packages/api-client/src/generated/${spec}/model`,
      },
    };
  }
}

export default defineConfig(entries as Entries);

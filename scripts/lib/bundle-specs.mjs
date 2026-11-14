import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { listYaml } from './roots.mjs';

const require = createRequire(import.meta.url);
const redocly = path.join(path.dirname(require.resolve('@redocly/cli/package.json')), 'bin/cli.js');

/**
 * Writes every spec of a root as one self-contained YAML file: what a spec takes from components/
 * is copied into its own `components`, so the published file can be read without the rest of the
 * repository and without allowing references to other files.
 *
 * The output keeps the layout of the sources: `openapi/public/tasks.yaml`,
 * `openapi/internal/task-service.yaml`, `asyncapi/task-service.yaml`.
 *
 * @param {object} options
 * @param {string} options.repository Absolute path of the repository root.
 * @param {{ openapi: string, asyncapi: string }} options.root Folders of the specs, relative to it.
 * @param {string} options.output Absolute path of the folder to fill; it is emptied first.
 * @returns {string[]} Paths written, relative to the output folder, sorted.
 */
export function bundleSpecs({ repository, root, output }) {
  rmSync(output, { recursive: true, force: true });
  const written = [];

  for (const [kind, folder] of [
    ['openapi', root.openapi],
    ['asyncapi', root.asyncapi],
  ]) {
    // One Redocly process per folder: it names each output after its source file.
    const groups = new Map();
    for (const spec of listYaml(path.join(repository, folder))) {
      const group = path.posix.dirname(spec);
      groups.set(group, [...(groups.get(group) ?? []), spec]);
    }
    for (const [group, specs] of groups) {
      const target = path.join(output, kind, group);
      mkdirSync(target, { recursive: true });
      const sources = specs.map((spec) => `${folder}/${spec}.yaml`);
      // A single source is written to the path given; several are written into the folder given.
      const destination =
        specs.length === 1 ? path.join(target, `${path.posix.basename(specs[0])}.yaml`) : target;
      const run = spawnSync(process.execPath, [redocly, 'bundle', ...sources, '-o', destination], {
        cwd: repository,
        encoding: 'utf8',
      });
      if (run.status !== 0) {
        throw new Error(`redocly could not bundle ${sources.join(', ')}:\n${run.stderr}`);
      }
      written.push(...specs.map((spec) => `${kind}/${spec}.yaml`));
    }
  }
  return written.sort();
}

#!/usr/bin/env node
/**
 * Last step of the build of @cadenway/contracts: writes the specs of openapi/ and asyncapi/ into
 * packages/contracts/specs/, each as one self-contained file, so that the package ships them
 * (`@cadenway/contracts/specs/openapi/internal/task-service.yaml`) and a consumer generates its own
 * client from the published contract.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundleSpecs } from './lib/bundle-specs.mjs';
import { ROOTS } from './lib/roots.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(repository, 'packages/contracts/specs');

const written = bundleSpecs({ repository, root: ROOTS[0], output });
console.log(
  written.length === 0
    ? 'specs: no spec to ship yet.'
    : `specs: ${written.map((file) => `packages/contracts/specs/${file}`).join('\nspecs: ')}`,
);

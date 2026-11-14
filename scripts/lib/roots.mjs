import { existsSync, readdirSync } from 'node:fs';

/**
 * Folders the generation reads and writes, relative to the repository root. Every path uses `/`.
 *
 * @typedef {object} Root
 * @property {string} name Short name used in logs and in the orval entry names.
 * @property {string} openapi Folder of the OpenAPI documents.
 * @property {string} asyncapi Folder of the AsyncAPI documents.
 * @property {string} contracts Where the types, validators and events are written.
 * @property {string} client Where the Angular services of the public documents are written.
 */

/**
 * The contracts of the repository, then the documents of tests/redocly/valid/. The second root is
 * generated and committed like the first: tests/codegen/ imports it, so a generator change that
 * alters the code shows in a diff and is compiled, while openapi/ and asyncapi/ hold no fixture that
 * would be published.
 *
 * @type {readonly Root[]}
 */
export const ROOTS = [
  {
    name: 'contracts',
    openapi: 'openapi',
    asyncapi: 'asyncapi',
    contracts: 'packages/contracts/src/generated',
    client: 'packages/api-client/src/generated',
  },
  {
    name: 'fixture',
    openapi: 'tests/redocly/valid/openapi',
    asyncapi: 'tests/redocly/valid/asyncapi',
    contracts: 'tests/codegen/generated/contracts',
    client: 'tests/codegen/generated/api-client',
  },
];

/** Folder of the components the specs share by `$ref`; it holds no route and no event. */
export const SHARED = 'components';

/**
 * Lists the YAML documents of a folder as paths below it, without extension (`public/tasks`),
 * sorted so that the generation order does not depend on the file system.
 *
 * @param {string} folder Folder to read; a missing folder holds no document.
 * @returns {string[]} Document paths below the folder.
 */
export function listYaml(folder) {
  if (!existsSync(folder)) {
    return [];
  }
  return readdirSync(folder, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => file.replaceAll('\\', '/').replace(/\.ya?ml$/, ''))
    .sort();
}

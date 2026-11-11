/**
 * Generates the event modules of `@waypoint/contracts` from the AsyncAPI documents: one TypeScript
 * module per document, holding the event names and the payload types. Called by
 * `scripts/generate.mjs`; it is not a command of its own.
 *
 * The payload types come from `@asyncapi/modelina`, used as a library. The event names and the
 * name-to-payload map are read from the channels of the document.
 *
 * Constraints a document must respect, each reported as an error:
 * - `asyncapi: 3.0.0`: the installed Modelina does not read a later version and would silently
 *   produce an `any` model instead;
 * - every channel has an `address`, which is the event name, and at least one message;
 * - every message payload is a `$ref` to `#/components/schemas/<Name>`, and so is every nested
 *   object or enumeration: an inline schema would be named `AnonymousSchema_<n>`, a name that
 *   changes whenever the document is reordered.
 *
 * No runtime validator is generated for event payloads.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { parse } from 'yaml';

import { listSpecFiles } from './lib/specs.mjs';

// Modelina is a CommonJS package whose named exports Node.js cannot detect statically.
const { ConstrainedDictionaryModel, TS_DESCRIPTION_PRESET, TypeScriptGenerator } = createRequire(
  import.meta.url,
)('@asyncapi/modelina');

const SUPPORTED_VERSION = '3.0.0';
const SCHEMA_REF = /^#\/components\/schemas\/([A-Za-z_$][A-Za-z0-9_$]*)$/;

/** Follows local `$ref`s of a document until a value that is not a reference. */
function resolveLocal(document, node, trail) {
  let current = node;
  for (let depth = 0; current && typeof current.$ref === 'string'; depth += 1) {
    const reference = current.$ref;
    if (!reference.startsWith('#/') || depth > 20) {
      throw new Error(`${trail}: only local references are supported here, got "${reference}".`);
    }
    current = reference
      .slice(2)
      .split('/')
      .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'))
      .reduce((value, segment) => value?.[segment], document);
    if (current === undefined) throw new Error(`${trail}: "${reference}" does not exist.`);
  }
  return current;
}

/**
 * Reads the events of a document: one entry per channel, with the names of the payload types of
 * its messages.
 *
 * @returns {{ name: string, payloads: string[] }[]} Sorted by event name.
 */
function readEvents(document, label) {
  const events = [];
  for (const [key, rawChannel] of Object.entries(document.channels ?? {})) {
    const trail = `${label}: channel "${key}"`;
    const channel = resolveLocal(document, rawChannel, trail);
    if (typeof channel.address !== 'string' || channel.address === '') {
      throw new Error(`${trail} has no address; the address is the event name.`);
    }
    const payloads = Object.entries(channel.messages ?? {}).map(([messageKey, rawMessage]) => {
      const message = resolveLocal(document, rawMessage, `${trail}, message "${messageKey}"`);
      const match = SCHEMA_REF.exec(message.payload?.$ref ?? '');
      if (!match) {
        throw new Error(
          `${trail}, message "${messageKey}": the payload must be a $ref to #/components/schemas/<Name>.`,
        );
      }
      return match[1];
    });
    if (payloads.length === 0) throw new Error(`${trail} declares no message.`);
    events.push({ name: channel.address, payloads: [...new Set(payloads)].sort() });
  }
  const duplicate = events.find((event, index) =>
    events.some((other, otherIndex) => otherIndex < index && other.name === event.name),
  );
  if (duplicate) throw new Error(`${label}: two channels share the address "${duplicate.name}".`);
  return events.sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

/** Renders the payload types of a document with Modelina, as exported declarations. */
async function renderModels(document, source, label) {
  const generator = new TypeScriptGenerator({
    modelType: 'interface',
    enumType: 'union',
    // Properties keep their wire names; no renaming to a TypeScript convention.
    rawPropertyNames: true,
    // The path lets the parser resolve references to sibling files.
    processorOptions: { asyncapi: { source } },
    presets: [
      TS_DESCRIPTION_PRESET,
      {
        interface: {
          // Modelina turns "additional properties are allowed" into a member named
          // `additionalProperties`, which does not exist on the wire.
          property({ property, content }) {
            const unwrapped =
              property.property instanceof ConstrainedDictionaryModel &&
              property.property.serializationType === 'unwrap';
            return unwrapped ? '' : content;
          },
        },
      },
    ],
  });

  const models = await generator.generate(document);
  return models
    .sort((left, right) => left.modelName.localeCompare(right.modelName, 'en'))
    .map((model) => {
      if (/^AnonymousSchema_/.test(model.modelName)) {
        throw new Error(
          `${label}: an inline schema would be generated as ${model.modelName}; move it to components/schemas and reference it.`,
        );
      }
      const declaration = new RegExp(`^(interface|type) ${model.modelName}\\b`, 'm');
      if (!declaration.test(model.result)) {
        throw new Error(`${label}: unexpected output of Modelina for ${model.modelName}.`);
      }
      return { name: model.modelName, code: model.result.replace(declaration, 'export $&') };
    });
}

/**
 * Generates one event module per AsyncAPI document of a directory.
 *
 * @param {object} input
 * @param {string} input.specsDirectory Absolute directory holding the AsyncAPI documents.
 * @param {string} input.header Comment written at the top of every module.
 * @returns {Promise<{ file: string, content: string }[]>} Modules to write, `file` being relative
 *   to the events output directory. Empty when the directory holds no document.
 */
export async function generateEvents({ specsDirectory, header }) {
  const modules = [];
  for (const relative of listSpecFiles(specsDirectory, 'asyncapi')) {
    const source = path.join(specsDirectory, relative);
    const document = parse(readFileSync(source, 'utf8'));
    if (document.asyncapi !== SUPPORTED_VERSION) {
      throw new Error(
        `${relative}: asyncapi ${document.asyncapi} is not supported; use ${SUPPORTED_VERSION}.`,
      );
    }

    const events = readEvents(document, relative);
    const models = await renderModels(document, source, relative);
    const known = new Set(models.map((model) => model.name));
    for (const event of events) {
      const missing = event.payloads.find((payload) => !known.has(payload));
      if (missing) {
        throw new Error(`${relative}: no type was generated for the payload ${missing}.`);
      }
    }

    const names = events.map((event) => `  ${JSON.stringify(event.name)},`).join('\n');
    const payloads = events
      .map((event) => `  ${JSON.stringify(event.name)}: ${event.payloads.join(' | ')};`)
      .join('\n');
    const content = [
      header,
      '/** Names of the events of this contract: the address of each channel. */\n' +
        `export const eventNames = [\n${names}\n] as const;`,
      '/** Name of one event of this contract. */\n' +
        'export type EventName = (typeof eventNames)[number];',
      '/** Payload type of each event of this contract, by event name. */\n' +
        `export interface EventPayloads {\n${payloads}\n}`,
      ...models.map((model) => model.code),
    ].join('\n\n');

    modules.push({ file: relative.replace(/\.(ya?ml|json)$/i, '.ts'), content: `${content}\n` });
  }
  return modules;
}

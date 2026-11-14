import { convertSchema, docblock, quote } from './json-schema.mjs';

/**
 * @typedef {object} EventMessage
 * @property {string} name Versioned event name, `task.updated.v1`.
 * @property {string} [summary] One-line description of the event.
 * @property {Record<string, unknown>} payload Payload schema, references resolved.
 * @property {string} pointer Place of the message in its document, for error messages.
 */

const EVENT_NAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+\.v[1-9][0-9]*$/;

/**
 * Collects the messages of an AsyncAPI document whose references are resolved, once per event
 * name and sorted by name.
 *
 * @param {Record<string, any>} document AsyncAPI 3.0.0 document, dereferenced.
 * @returns {EventMessage[]} The events of the document.
 */
export function collectEvents(document) {
  if (document?.asyncapi !== '3.0.0') {
    throw new Error(
      `#/asyncapi: the event generator reads AsyncAPI 3.0.0 only, found "${String(document?.asyncapi)}".`,
    );
  }
  const found = [
    ...Object.entries(document.components?.messages ?? {}).map(([key, message]) => ({
      message,
      pointer: `#/components/messages/${key}`,
    })),
    ...Object.entries(document.channels ?? {}).flatMap(([channel, definition]) =>
      Object.entries(definition?.messages ?? {}).map(([key, message]) => ({
        message,
        pointer: `#/channels/${channel}/messages/${key}`,
      })),
    ),
  ];

  /** @type {Map<string, EventMessage & { shape: string }>} */
  const events = new Map();
  for (const { message, pointer } of found) {
    const name = message?.name;
    if (typeof name !== 'string' || !EVENT_NAME.test(name)) {
      throw new Error(`${pointer}: a message needs a name like "task.updated.v1".`);
    }
    if (!message.payload || typeof message.payload !== 'object') {
      throw new Error(`${pointer}: the message "${name}" has no payload.`);
    }
    const shape = JSON.stringify(message.payload);
    const known = events.get(name);
    if (known && known.shape !== shape) {
      throw new Error(
        `${pointer}: the event "${name}" is declared twice with different payloads (see ${known.pointer}).`,
      );
    }
    if (!known) {
      events.set(name, {
        name,
        summary: message.summary ?? message.title,
        payload: message.payload,
        pointer,
        shape,
      });
    }
  }
  if (events.size === 0) throw new Error('#: the document declares no event.');
  return [...events.values()]
    .map(({ shape: _shape, ...event }) => event)
    .sort((left, right) => (left.name < right.name ? -1 : 1));
}

/**
 * Splits an event name into the words its identifiers are built from.
 *
 * @param {string} name Event name, `task.status-changed.v1`.
 * @returns {string[]} `['task', 'status', 'changed', 'v1']`.
 */
function words(name) {
  return name.split(/[.-]/);
}

/**
 * Names the declarations written for an event.
 *
 * @param {string} name Event name, `task.status-changed.v1`.
 * @returns {{ constant: string, type: string, schema: string }} `TASK_STATUS_CHANGED_V1`,
 *   `TaskStatusChangedV1` and `taskStatusChangedV1Schema`.
 */
export function identifiers(name) {
  const parts = words(name);
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return {
    constant: parts.map((part) => part.toUpperCase()).join('_'),
    type: pascal,
    schema: `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}Schema`,
  };
}

/**
 * Writes the module of one AsyncAPI document: for each event its name, the type of its payload and
 * the zod validator of that payload, then the names, payload types and validators of the document
 * by event name.
 *
 * @param {object} options
 * @param {string} options.source Path of the document, written in the header.
 * @param {Record<string, any>} options.document AsyncAPI 3.0.0 document, dereferenced.
 * @returns {string} TypeScript source of the module.
 */
export function renderEventsModule({ source, document }) {
  const events = collectEvents(document);
  const taken = new Map();
  const blocks = [];

  for (const event of events) {
    const ids = identifiers(event.name);
    const clash = taken.get(ids.type);
    if (clash) {
      throw new Error(
        `${event.pointer}: the events "${clash}" and "${event.name}" would share the identifier ${ids.type}.`,
      );
    }
    taken.set(ids.type, event.name);

    const payload = event.payload;
    const pointer = `${event.pointer}/payload`;
    const isObject = [payload.type].flat().includes('object') && payload.properties;
    if (!isObject || [payload.type].flat().length !== 1) {
      throw new Error(`${pointer}: the payload of an event is an object with declared members.`);
    }
    const converted = convertSchema(payload, pointer);
    const summary = event.summary ? ` ${String(event.summary).trim()}` : '';

    blocks.push(
      [
        `/** Name of the event \`${event.name}\`.${summary.replaceAll('*/', '*\\/')} */`,
        `export const ${ids.constant} = ${quote(event.name)};`,
        '',
        docblock(
          {
            description: [`Payload of the event \`${event.name}\`.`, payload.description]
              .filter(Boolean)
              .join('\n'),
            deprecated: payload.deprecated,
          },
          '',
        ) + `export interface ${ids.type} ${converted.type}`,
        '',
        `/** Validator of the payload of the event \`${event.name}\`. */`,
        `export const ${ids.schema} = ${converted.zod} satisfies zod.ZodType<${ids.type}>;`,
      ].join('\n'),
    );
  }

  const named = events.map((event) => ({ event, ids: identifiers(event.name) }));
  return [
    '/**',
    ` * Generated by scripts/generate-events.mjs from ${source}.`,
    ' * Do not edit: change the spec and run `pnpm generate`.',
    ' */',
    "import * as zod from 'zod';",
    '',
    blocks.join('\n\n'),
    '',
    '/** Names of the events of this document. */',
    `export const EVENT_NAMES = [${named.map(({ ids }) => ids.constant).join(', ')}] as const;`,
    '',
    '/** Name of an event of this document. */',
    'export type EventName = (typeof EVENT_NAMES)[number];',
    '',
    '/** Payload type of each event of this document, by event name. */',
    'export interface EventPayloads {',
    ...named.map(({ event, ids }) => `  ${quote(event.name)}: ${ids.type};`),
    '}',
    '',
    '/** Payload validator of each event of this document, by event name. */',
    'export const eventSchemas = {',
    ...named.map(({ event, ids }) => `  ${quote(event.name)}: ${ids.schema},`),
    '} as const satisfies { readonly [Name in EventName]: zod.ZodType<EventPayloads[Name]> };',
    '',
  ].join('\n');
}

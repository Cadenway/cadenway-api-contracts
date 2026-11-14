import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { bundleSpecs } from '../../scripts/lib/bundle-specs.mjs';
import {
  collectEvents,
  identifiers,
  renderEventsModule,
} from '../../scripts/lib/events-module.mjs';
import { convertSchema, quote } from '../../scripts/lib/json-schema.mjs';
import { ROOTS } from '../../scripts/lib/roots.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const envelope = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

function documentWith(messages) {
  return { asyncapi: '3.0.0', components: { messages } };
}

describe('schema conversion of the event generator', () => {
  it('writes the type and the validator of each string format', () => {
    expect(convertSchema({ type: 'string', format: 'uuid' }, '#')).toEqual({
      type: 'string',
      zod: 'zod.uuid()',
    });
    expect(convertSchema({ type: 'string', format: 'date-time' }, '#').zod).toBe(
      'zod.iso.datetime()',
    );
    expect(convertSchema({ type: 'string', format: 'date' }, '#').zod).toBe('zod.iso.date()');
    expect(convertSchema({ type: 'string', format: 'uri-reference' }, '#').zod).toBe(
      'zod.string()',
    );
    expect(
      convertSchema({ type: 'string', minLength: 1, maxLength: 3, pattern: "^[a-z']+$" }, '#').zod,
    ).toBe("zod.string().min(1).max(3).regex(new RegExp('^[a-z\\']+$'))");
  });

  it('writes numbers with their bounds', () => {
    expect(convertSchema({ type: 'integer', minimum: 1, maximum: 100 }, '#')).toEqual({
      type: 'number',
      zod: 'zod.int().min(1).max(100)',
    });
    expect(convertSchema({ type: 'number', exclusiveMinimum: 0, multipleOf: 0.5 }, '#').zod).toBe(
      'zod.number().gt(0).multipleOf(0.5)',
    );
  });

  it('writes enumerations, constants and nullable values', () => {
    expect(convertSchema({ type: 'string', enum: ['open', 'closed'] }, '#')).toEqual({
      type: "'open' | 'closed'",
      zod: "zod.enum(['open', 'closed'])",
    });
    expect(convertSchema({ const: 1 }, '#')).toEqual({ type: '1', zod: 'zod.literal(1)' });
    expect(convertSchema({ enum: [1, 'one', null] }, '#')).toEqual({
      type: "1 | 'one' | null",
      zod: "zod.literal([1, 'one', null])",
    });
    expect(convertSchema({ type: ['string', 'null'] }, '#')).toEqual({
      type: 'string | null',
      zod: 'zod.string().nullable()',
    });
    expect(convertSchema({ type: 'null' }, '#')).toEqual({ type: 'null', zod: 'zod.null()' });
  });

  it('writes arrays, unions and maps', () => {
    expect(convertSchema({ type: 'array', minItems: 1, items: { type: 'string' } }, '#')).toEqual({
      type: 'string[]',
      zod: 'zod.array(zod.string()).min(1)',
    });
    expect(convertSchema({ type: 'array', items: { type: ['integer', 'null'] } }, '#').type).toBe(
      '(number | null)[]',
    );
    expect(convertSchema({ oneOf: [{ type: 'string' }, { type: 'integer' }] }, '#')).toEqual({
      type: 'string | number',
      zod: 'zod.union([zod.string(), zod.int()])',
    });
    expect(
      convertSchema({ type: 'object', additionalProperties: { type: 'boolean' } }, '#'),
    ).toEqual({
      type: '{ [key: string]: boolean }',
      zod: 'zod.record(zod.string(), zod.boolean())',
    });
    expect(convertSchema({ type: 'object' }, '#').zod).toBe(
      'zod.record(zod.string(), zod.unknown())',
    );
  });

  it('writes objects with optional members, documentation and quoted names', () => {
    const converted = convertSchema(
      {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Id of the task.' },
          'due-date': { type: 'string', format: 'date', deprecated: true },
        },
      },
      '#',
    );

    expect(converted.type).toBe(
      [
        '{',
        '  /** Id of the task. */',
        '  id: string;',
        '  /** @deprecated */',
        "  'due-date'?: string;",
        '}',
      ].join('\n'),
    );
    expect(converted.zod).toBe(
      [
        'zod.object({',
        '  id: zod.string(),',
        "  'due-date': zod.iso.date().optional(),",
        '})',
      ].join('\n'),
    );
  });

  it('keeps or refuses unknown members when the schema says so', () => {
    const properties = { id: { type: 'string' } };

    expect(convertSchema({ type: 'object', properties, additionalProperties: true }, '#')).toEqual({
      type: '{\n  id?: string;\n  [key: string]: unknown;\n}',
      zod: 'zod.looseObject({\n  id: zod.string().optional(),\n})',
    });
    expect(
      convertSchema({ type: 'object', properties, additionalProperties: false }, '#').zod,
    ).toBe('zod.strictObject({\n  id: zod.string().optional(),\n})');
  });

  it('refuses what it cannot express, with the place of the schema', () => {
    expect(() => convertSchema({ type: 'string', contentEncoding: 'base64' }, '#/a')).toThrow(
      '#/a: the event generator does not support "contentEncoding"',
    );
    expect(() => convertSchema({ type: 'string', format: 'ipv4' }, '#/a')).toThrow(
      'does not know the string format "ipv4"',
    );
    expect(() =>
      convertSchema({ type: 'object', properties: { a: { allOf: [] } } }, '#/payload'),
    ).toThrow('#/payload/properties/a: the event generator does not support "allOf"');
    expect(() => convertSchema({ type: 'object', required: ['a'], properties: {} }, '#')).toThrow(
      'the required member "a" is not declared',
    );
    expect(() => convertSchema({ type: ['string', 'integer'] }, '#')).toThrow('use "oneOf"');
    expect(() => convertSchema({ description: 'Anything.' }, '#')).toThrow('needs a "type"');
    expect(() => convertSchema({ $ref: '#/components/schemas/A' }, '#')).toThrow('not resolved');
  });

  it('quotes a string as a TypeScript literal', () => {
    expect(quote('task.updated.v1')).toBe("'task.updated.v1'");
    expect(quote('l’écran "SSO" d\'accueil\\')).toBe("'l’écran \"SSO\" d\\'accueil\\\\'");
  });
});

describe('module of an AsyncAPI document', () => {
  it('names the declarations of an event after its versioned name', () => {
    expect(identifiers('task.status-changed.v1')).toEqual({
      constant: 'TASK_STATUS_CHANGED_V1',
      type: 'TaskStatusChangedV1',
      schema: 'taskStatusChangedV1Schema',
    });
  });

  it('collects each event once, sorted by name', () => {
    const second = { name: 'task.updated.v1', payload: envelope };
    const first = { name: 'task.created.v1', summary: 'A task was created.', payload: envelope };
    const events = collectEvents({
      asyncapi: '3.0.0',
      channels: { taskUpdatedV1: { messages: { taskUpdatedV1: second } } },
      components: { messages: { taskUpdatedV1: second, taskCreatedV1: first } },
    });

    expect(events.map((event) => event.name)).toEqual(['task.created.v1', 'task.updated.v1']);
    expect(events[0].summary).toBe('A task was created.');
  });

  it('writes the names, the payload types and the validators by event name', () => {
    const module = renderEventsModule({
      source: 'asyncapi/task-service.yaml',
      document: documentWith({
        taskCreatedV1: { name: 'task.created.v1', payload: envelope },
        taskUpdatedV1: { name: 'task.updated.v1', payload: envelope },
      }),
    });

    expect(module).toContain(
      'Generated by scripts/generate-events.mjs from asyncapi/task-service.yaml.',
    );
    expect(module).toContain("export const TASK_CREATED_V1 = 'task.created.v1';");
    expect(module).toContain('export interface TaskCreatedV1 {\n  id: string;\n}');
    expect(module).toContain(
      'export const taskCreatedV1Schema = zod.object({\n  id: zod.uuid(),\n}) satisfies zod.ZodType<TaskCreatedV1>;',
    );
    expect(module).toContain(
      'export const EVENT_NAMES = [TASK_CREATED_V1, TASK_UPDATED_V1] as const;',
    );
    expect(module).toContain("  'task.updated.v1': TaskUpdatedV1;");
    expect(module).toContain("  'task.updated.v1': taskUpdatedV1Schema,");
  });

  it('refuses a document it would turn into wrong or empty code', () => {
    expect(() => collectEvents({ asyncapi: '3.1.0' })).toThrow('reads AsyncAPI 3.0.0 only');
    expect(() => collectEvents(documentWith({}))).toThrow('declares no event');
    expect(() =>
      collectEvents(documentWith({ a: { name: 'TaskUpdated', payload: envelope } })),
    ).toThrow('needs a name like "task.updated.v1"');
    expect(() => collectEvents(documentWith({ a: { name: 'task.updated.v1' } }))).toThrow(
      'has no payload',
    );
    expect(() =>
      collectEvents(
        documentWith({
          a: { name: 'task.updated.v1', payload: envelope },
          b: { name: 'task.updated.v1', payload: { ...envelope, required: [] } },
        }),
      ),
    ).toThrow('declared twice with different payloads');
    expect(() =>
      renderEventsModule({
        source: 'a.yaml',
        document: documentWith({ a: { name: 'task.updated.v1', payload: { type: 'string' } } }),
      }),
    ).toThrow('the payload of an event is an object with declared members');
    expect(() =>
      renderEventsModule({
        source: 'a.yaml',
        document: documentWith({
          a: { name: 'task.status-changed.v1', payload: envelope },
          b: { name: 'task.status.changed.v1', payload: envelope },
        }),
      }),
    ).toThrow('would share the identifier TaskStatusChangedV1');
  });
});

describe('specs shipped in @cadenway/contracts', () => {
  it('writes each spec as one file that references nothing outside itself', () => {
    const output = path.join(repository, '.cache/test-bundle-specs');
    try {
      const written = bundleSpecs({ repository, root: ROOTS[1], output });

      expect(written).toEqual([
        'asyncapi/identity-service.yaml',
        'asyncapi/task-service.yaml',
        'openapi/internal/task-service.yaml',
        'openapi/public/tasks.yaml',
      ]);
      for (const file of written) {
        const text = readFileSync(path.join(output, file), 'utf8');
        expect(text.match(/\$ref: ['"]?[^#'"\s]/g)).toBeNull();
      }
      const tasks = readFileSync(path.join(output, 'openapi/public/tasks.yaml'), 'utf8');
      expect(tasks).toContain("$ref: '#/components/responses/Problem'");
      expect(tasks).toContain('RFC 9457 problem');
      expect(readFileSync(path.join(output, 'asyncapi/task-service.yaml'), 'utf8')).toContain(
        "$ref: '#/components/schemas/Actor'",
      );
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
    expect(existsSync(output)).toBe(false);
  }, 60_000);
});

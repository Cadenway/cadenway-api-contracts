import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  compareEventExamples,
  compareEvents,
  eventExamples,
} from '../../scripts/lib/event-compatibility.mjs';
import { renderEventsModule } from '../../scripts/lib/events-module.mjs';
import { dereference } from '../../scripts/lib/dereference.mjs';

const name = 'task.updated.v1';
const string = { type: 'string' };

function payload(overrides = {}) {
  return { type: 'object', properties: { id: string }, required: ['id'], ...overrides };
}

function document(schema, examples = [], restriction = false) {
  const message = { name, payload: schema, examples, 'x-cadenway-restricted': restriction };
  return {
    asyncapi: '3.0.0',
    components: { messages: { updated: message } },
    channels: {
      updated: {
        address: `${restriction ? 'restricted' : 'evt'}.${name}`,
        messages: { updated: message },
      },
    },
  };
}

async function generatedSamples(document) {
  const code = renderEventsModule({ source: 'asyncapi/task.yaml', document }).replace(
    "'zod'",
    JSON.stringify(import.meta.resolve('zod')),
  );
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
  });
  const url = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
  const { eventSchemas } = await import(/* @vite-ignore */ url);
  return { validators: eventSchemas, examples: eventExamples(document) };
}

describe('event compatibility across rollout directions', () => {
  it('accepts optional additions to an object whose old validator discards unknown members', async () => {
    const before = document(payload(), [{ payload: { id: '1' } }]);
    const after = document(payload({ properties: { id: string, label: string } }), [
      { payload: { id: '1', label: 'Backlog' } },
    ]);

    expect(compareEvents(before, after)).toEqual([]);
    expect(
      compareEventExamples(await generatedSamples(before), await generatedSamples(after)),
    ).toEqual([]);
  });

  it('permits new documented values in an extensible event vocabulary', () => {
    const before = document(
      payload({
        properties: {
          id: string,
          action: { type: 'string', 'x-extensible-enum': ['created', 'deleted'] },
        },
      }),
    );
    const after = document(
      payload({
        properties: {
          id: string,
          action: { type: 'string', 'x-extensible-enum': ['created', 'deleted', 'renamed'] },
        },
      }),
    );
    expect(compareEvents(before, after)).toEqual([]);
  });

  it('requires a new version for an optional addition to a closed schema', async () => {
    const before = document(payload({ additionalProperties: false }), [{ payload: { id: '1' } }]);
    const after = document(
      payload({ additionalProperties: false, properties: { id: string, label: string } }),
      [{ payload: { id: '1', label: 'Backlog' } }],
    );

    expect(compareEvents(before, after)).toEqual([
      expect.stringContaining('/properties/label: the previous closed validator rejects'),
    ]);
    expect(
      compareEventExamples(await generatedSamples(before), await generatedSamples(after)),
    ).toEqual([`${name}: previous validator rejects a candidate payload example.`]);
  });

  it('checks nested schemas inside arrays and retains the property path in findings', () => {
    const items = { type: 'object', properties: { label: string }, additionalProperties: false };
    const before = document(
      payload({ properties: { id: string, tags: { type: 'array', items } } }),
    );
    const withColor = { ...items, properties: { ...items.properties, color: string } };
    const after = document(
      payload({ properties: { id: string, tags: { type: 'array', items: withColor } } }),
    );

    expect(compareEvents(before, after)).toEqual([
      expect.stringContaining('/properties/tags/items/properties/color'),
    ]);
  });

  it('detects when the candidate validator rejects an old payload and keeps payload values private', async () => {
    const before = document(payload(), [{ payload: { id: 'private-value' } }]);
    const after = document(payload({ properties: { id: { type: 'string', maxLength: 3 } } }));

    expect(compareEvents(before, after)).toEqual([
      expect.stringContaining('/properties/id: constraints changed'),
    ]);
    expect(
      compareEventExamples(await generatedSamples(before), await generatedSamples(after)),
    ).toEqual([`${name}: candidate validator rejects a previous payload example.`]);
  });

  it('protects changes to the route and removal of a published version', () => {
    const before = document(payload());
    expect(compareEvents(before, document(payload(), [], true))).toEqual([
      expect.stringContaining('routing or restriction changed'),
    ]);

    const replacement = { name: 'task.updated.v2', payload: payload() };
    const after = {
      asyncapi: '3.0.0',
      components: { messages: { version2: replacement } },
      channels: { updated: { address: `evt.${replacement.name}`, messages: { replacement } } },
    };
    expect(compareEvents(before, after)).toEqual([
      expect.stringContaining('published event removed'),
    ]);
    expect(
      compareEvents(before, {
        ...before,
        channels: { ...before.channels, updatedV2: after.channels.updated },
      }),
    ).toEqual([]);
  });

  it('ignores documentation and enum order while preserving constraints', () => {
    const before = document(payload({ properties: { id: { type: 'string', enum: ['a', 'b'] } } }));
    const after = document(
      payload({
        description: 'Updated documentation.',
        properties: { id: { type: 'string', enum: ['b', 'a'], description: 'The id.' } },
      }),
    );

    expect(compareEvents(before, after)).toEqual([]);
  });
});

describe('task collaboration event examples', () => {
  it('validates and preserves the authored examples for each new fact', async () => {
    const names = [
      'comment.created.v1',
      'comment.updated.v1',
      'comment.deleted.v1',
      'task.description-mentions-changed.v1',
      'task.watcher-changed.v1',
      'task.dependency-added.v1',
      'task.dependency-removed.v1',
      'milestone.reached.v1',
      'task.occurrence-created.v1',
      'space.task-template-changed.v1',
      'list.saved-view-changed.v1',
      'space.access-republished.v1',
    ];
    const document = dereference('asyncapi/task-service.yaml', process.cwd());
    const { validators, examples } = await generatedSamples(document);
    for (const name of names) {
      const samples = examples.filter((example) => example.name === name);
      expect(samples.length, name).toBeGreaterThan(0);
      for (const sample of samples)
        expect(validators[name].parse(sample.payload), name).toEqual(sample.payload);
    }
  });
});

import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { dereference } from '../../scripts/lib/dereference.mjs';
import { eventExamples } from '../../scripts/lib/event-compatibility.mjs';

// Every payload example authored in asyncapi/ must pass the validator generated from the same
// document: consumers copy these examples into their fixtures, and `pnpm breaking` only replays
// the examples of events that already exist on main.

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const generated = import.meta.glob('../../packages/contracts/src/generated/events/*.ts');
const documents = readdirSync(path.join(repository, 'asyncapi')).filter((file) =>
  /\.ya?ml$/.test(file),
);

describe('authored event examples', () => {
  for (const file of documents) {
    it(`passes every example of asyncapi/${file} through its generated validator`, async () => {
      const module = `../../packages/contracts/src/generated/events/${file.replace(/\.ya?ml$/, '.ts')}`;
      expect(Object.keys(generated)).toContain(module);
      const { eventSchemas } = await generated[module]();
      const examples = eventExamples(dereference(`asyncapi/${file}`, repository));

      for (const { name, payload } of examples) {
        expect(Object.keys(eventSchemas)).toContain(name);
        const result = eventSchemas[name].safeParse(payload);
        expect(result.success, `${name}: ${result.error?.message ?? ''}`).toBe(true);
      }
    }, 60_000);
  }
});

it('only requests delivery authorization for a task subject', async () => {
  const file = 'notification-service';
  const { eventSchemas } =
    await generated[`../../packages/contracts/src/generated/events/${file}.ts`]();
  const event = 'notification.delivery-authorization-requested.v1';
  const example = eventExamples(dereference(`asyncapi/${file}.yaml`, repository)).find(
    ({ name }) => name === event,
  );
  expect(example).toBeDefined();
  const id = '019a7002-3c4d-7e5f-8a6b-7c8d9e0f1a23';
  const subjects = [
    [{ kind: 'task-id', taskId: id }, true],
    [{ kind: 'task-key', taskKey: 'CAD-482' }, true],
    [{ kind: 'list', listId: id }, false],
    [{ kind: 'space', spaceId: id }, false],
  ];
  for (const [subject, accepted] of subjects) {
    expect(eventSchemas[event].safeParse({ ...example.payload, subject }).success).toBe(accepted);
  }
});

import { isDeepStrictEqual } from 'node:util';

import { collectEvents } from './events-module.mjs';

const ANNOTATIONS = new Set(['$comment', 'description', 'title', 'examples', 'deprecated']);
const CHILDREN = new Set(['properties', 'items', 'oneOf', 'anyOf', 'additionalProperties']);

function sortedLiterals(values) {
  return values.map((value) => JSON.stringify(value)).sort();
}

function constraints(schema) {
  return Object.fromEntries(
    Object.entries(schema)
      .filter(
        ([name, value]) =>
          !ANNOTATIONS.has(name) &&
          !CHILDREN.has(name) &&
          !(name === 'required' && value.length === 0),
      )
      .map(([name, value]) => [name, Array.isArray(value) ? sortedLiterals(value) : value]),
  );
}

/** Reviews the supported schema subset conservatively and reports changes that need a version. */
function checkSchema(before, after, pointer, report) {
  if (!isDeepStrictEqual(constraints(before), constraints(after))) {
    report(pointer, 'constraints changed');
  }

  const previousProperties = before.properties ?? {};
  const nextProperties = after.properties ?? {};
  for (const [name, previous] of Object.entries(previousProperties)) {
    const member = `${pointer}/properties/${name}`;
    if (!Object.hasOwn(nextProperties, name)) {
      report(member, 'property removed');
      continue;
    }
    checkSchema(previous, nextProperties[name], member, report);
  }
  for (const name of Object.keys(nextProperties)) {
    if (Object.hasOwn(previousProperties, name)) continue;
    const member = `${pointer}/properties/${name}`;
    if (after.required?.includes(name)) {
      report(member, 'required property added');
    } else if (before.additionalProperties === false) {
      report(member, 'the previous closed validator rejects this new optional property');
    } else if (
      before.additionalProperties !== undefined ||
      Object.keys(previousProperties).length === 0
    ) {
      report(member, 'the previous validator preserved this property as unrestricted data');
    }
  }

  for (const name of ['items', 'additionalProperties']) {
    const previous = before[name];
    const next = after[name];
    if (previous && next && typeof previous === 'object' && typeof next === 'object') {
      checkSchema(previous, next, `${pointer}/${name}`, report);
    } else if (!isDeepStrictEqual(previous, next)) {
      report(`${pointer}/${name}`, 'schema changed');
    }
  }
  for (const name of ['oneOf', 'anyOf']) {
    const previous = before[name] ?? [];
    const next = after[name] ?? [];
    if (previous.length !== next.length) {
      report(`${pointer}/${name}`, 'alternatives changed');
    } else {
      previous.forEach((schema, index) =>
        checkSchema(schema, next[index], `${pointer}/${name}/${index}`, report),
      );
    }
  }
}

function addresses(document, name) {
  const values = Object.values(document.channels ?? {})
    .filter((channel) =>
      Object.values(channel.messages ?? {}).some((message) => message.name === name),
    )
    .map((channel) => channel.address);
  return [...new Set(values)].sort();
}

/** Each previously published event must remain readable in both rollout directions. */
export function compareEvents(previousDocument, nextDocument) {
  const previousEvents = collectEvents(previousDocument);
  const nextEvents = new Map(collectEvents(nextDocument).map((event) => [event.name, event]));
  const problems = [];

  for (const previous of previousEvents) {
    const next = nextEvents.get(previous.name);
    const report = (pointer, reason) =>
      problems.push(`${previous.name} ${pointer}: ${reason}. Keep this version and add a new one.`);
    if (!next) {
      report(previous.pointer, 'published event removed');
      continue;
    }
    if (
      next.restricted !== previous.restricted ||
      !isDeepStrictEqual(
        addresses(previousDocument, previous.name),
        addresses(nextDocument, previous.name),
      )
    ) {
      report(next.pointer, 'routing or restriction changed');
    }
    checkSchema(previous.payload, next.payload, `${next.pointer}/payload`, report);
  }
  return problems;
}

/** Collects the payloads of authored AsyncAPI message examples. */
export function eventExamples(document) {
  const messages = new Set([
    ...Object.values(document.components?.messages ?? {}),
    ...Object.values(document.channels ?? {}).flatMap((channel) =>
      Object.values(channel.messages ?? {}),
    ),
  ]);
  return [...messages].flatMap((message) =>
    (message.examples ?? [])
      .filter((example) => Object.hasOwn(example, 'payload'))
      .map(({ payload }) => ({ name: message.name, payload })),
  );
}

/** Validates message examples against both versions without including payload values in errors. */
export function compareEventExamples(previous, next) {
  const problems = [];
  for (const [origin, target, sample] of [
    ['previous', 'candidate', previous],
    ['candidate', 'previous', next],
  ]) {
    for (const { name, payload } of sample.examples) {
      if (!Object.hasOwn(previous.validators, name) || !Object.hasOwn(next.validators, name)) {
        continue;
      }
      const versions = { previous: previous.validators, candidate: next.validators };
      for (const version of [origin, target]) {
        if (!versions[version][name].safeParse(payload).success) {
          problems.push(`${name}: ${version} validator rejects a ${origin} payload example.`);
        }
      }
    }
  }
  return problems;
}

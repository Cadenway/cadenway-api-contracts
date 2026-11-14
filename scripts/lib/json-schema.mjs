/**
 * Turns the JSON Schema of an event payload into a TypeScript type and a zod validator, written
 * from the same walk so that the two cannot disagree.
 *
 * The converter knows the keywords listed below and refuses every other one with the place it was
 * found: a constraint the validator would silently drop is worse than a failed generation. Extend
 * the converter, with a test, when a spec needs a new keyword.
 */

/** Keywords that describe a schema without constraining it. */
const ANNOTATIONS = ['$comment', 'deprecated', 'description', 'examples', 'title'];

/** Keywords read for each kind of schema. */
const KEYWORDS = {
  union: ['oneOf', 'anyOf'],
  literal: ['type', 'enum', 'const'],
  string: ['type', 'format', 'minLength', 'maxLength', 'pattern'],
  number: ['type', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf'],
  boolean: ['type'],
  null: ['type'],
  array: ['type', 'items', 'minItems', 'maxItems'],
  object: ['type', 'properties', 'required', 'additionalProperties'],
};

/**
 * zod check of each string format. `date-time` accepts UTC instants only (`Z`), the unit of the
 * contract style; `uri-reference` has no check because a relative reference is any string.
 */
const STRING_FORMATS = {
  uuid: 'zod.uuid()',
  'date-time': 'zod.iso.datetime()',
  date: 'zod.iso.date()',
  email: 'zod.email()',
  uri: 'zod.url()',
  'uri-reference': 'zod.string()',
};

/**
 * @typedef {object} Converted
 * @property {string} type TypeScript type expression.
 * @property {string} zod zod expression that validates the same values.
 */

/**
 * Writes a string as a single-quoted TypeScript literal.
 *
 * @param {string} value Text of the literal.
 * @returns {string} The literal, with its quotes.
 */
export function quote(value) {
  return `'${JSON.stringify(value).slice(1, -1).replaceAll("'", "\\'").replaceAll('\\"', '"')}'`;
}

/**
 * Writes a JSDoc block from the description of a schema, or nothing when it has none.
 *
 * @param {{ description?: string, deprecated?: boolean } | undefined} schema Documented schema.
 * @param {string} pad Indentation of the block.
 * @returns {string} The block followed by a line break, or an empty string.
 */
export function docblock(schema, pad) {
  const lines = String(schema?.description ?? '')
    .replaceAll('*/', '*\\/')
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, all) => line !== '' || (index > 0 && index < all.length - 1));
  if (schema?.deprecated === true) lines.push('@deprecated');
  if (lines.length === 0) return '';
  if (lines.length === 1) return `${pad}/** ${lines[0]} */\n`;
  return `${pad}/**\n${lines.map((line) => `${pad} * ${line}`.trimEnd()).join('\n')}\n${pad} */\n`;
}

function fail(pointer, message) {
  throw new Error(`${pointer}: ${message}`);
}

function assertKeywords(schema, kind, pointer) {
  const known = new Set([...KEYWORDS[kind], ...ANNOTATIONS]);
  const unknown = Object.keys(schema).filter((keyword) => !known.has(keyword));
  if (unknown.length > 0) {
    fail(
      pointer,
      `the event generator does not support ${unknown.map((keyword) => `"${keyword}"`).join(', ')} on a schema of kind "${kind}".`,
    );
  }
}

function literal(value, pointer) {
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }
  return fail(pointer, 'only strings, numbers, booleans and null can be enumerated.');
}

function propertyName(name) {
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : quote(name);
}

function arrayOf(type) {
  return /^[\w.]+$/.test(type) || /^\{[^|&]*\}$/s.test(type) ? `${type}[]` : `(${type})[]`;
}

function convertLiteral(schema, pointer) {
  assertKeywords(schema, 'literal', pointer);
  const values = 'const' in schema ? [schema.const] : schema.enum;
  if (!Array.isArray(values) || values.length === 0) {
    fail(pointer, '"enum" must list at least one value.');
  }
  const literals = values.map((value) => literal(value, pointer));
  const strings = values.every((value) => typeof value === 'string');
  return {
    type: literals.join(' | '),
    zod:
      strings && values.length > 1
        ? `zod.enum([${literals.join(', ')}])`
        : `zod.literal(${literals.length === 1 ? literals[0] : `[${literals.join(', ')}]`})`,
  };
}

function convertString(schema, pointer) {
  assertKeywords(schema, 'string', pointer);
  let zod = 'zod.string()';
  if (schema.format !== undefined) {
    if (!Object.hasOwn(STRING_FORMATS, schema.format)) {
      fail(pointer, `the event generator does not know the string format "${schema.format}".`);
    }
    zod = STRING_FORMATS[schema.format];
  }
  if (schema.minLength !== undefined) zod += `.min(${Number(schema.minLength)})`;
  if (schema.maxLength !== undefined) zod += `.max(${Number(schema.maxLength)})`;
  if (schema.pattern !== undefined) zod += `.regex(new RegExp(${quote(schema.pattern)}))`;
  return { type: 'string', zod };
}

function convertNumber(schema, pointer, integer) {
  assertKeywords(schema, 'number', pointer);
  let zod = integer ? 'zod.int()' : 'zod.number()';
  if (schema.minimum !== undefined) zod += `.min(${Number(schema.minimum)})`;
  if (schema.maximum !== undefined) zod += `.max(${Number(schema.maximum)})`;
  if (schema.exclusiveMinimum !== undefined) zod += `.gt(${Number(schema.exclusiveMinimum)})`;
  if (schema.exclusiveMaximum !== undefined) zod += `.lt(${Number(schema.exclusiveMaximum)})`;
  if (schema.multipleOf !== undefined) zod += `.multipleOf(${Number(schema.multipleOf)})`;
  return { type: 'number', zod };
}

function convertArray(schema, pointer, depth) {
  assertKeywords(schema, 'array', pointer);
  if (!schema.items || typeof schema.items !== 'object' || Array.isArray(schema.items)) {
    fail(pointer, 'an array needs one "items" schema.');
  }
  const items = convertSchema(schema.items, `${pointer}/items`, depth);
  let zod = `zod.array(${items.zod})`;
  if (schema.minItems !== undefined) zod += `.min(${Number(schema.minItems)})`;
  if (schema.maxItems !== undefined) zod += `.max(${Number(schema.maxItems)})`;
  return { type: arrayOf(items.type), zod };
}

function convertObject(schema, pointer, depth) {
  assertKeywords(schema, 'object', pointer);
  const properties = Object.entries(schema.properties ?? {});
  const required = schema.required ?? [];
  const additional = schema.additionalProperties;
  if (!Array.isArray(required)) fail(pointer, '"required" must be a list of member names.');
  for (const name of required) {
    if (!Object.hasOwn(schema.properties ?? {}, name)) {
      fail(pointer, `the required member "${name}" is not declared in "properties".`);
    }
  }

  // No declared member: a map, of anything unless `additionalProperties` gives the value schema.
  if (properties.length === 0) {
    if (additional === false) return { type: 'Record<string, never>', zod: 'zod.strictObject({})' };
    const values =
      additional && typeof additional === 'object'
        ? convertSchema(additional, `${pointer}/additionalProperties`, depth)
        : { type: 'unknown', zod: 'zod.unknown()' };
    return {
      type: `{ [key: string]: ${values.type} }`,
      zod: `zod.record(zod.string(), ${values.zod})`,
    };
  }

  if (additional && typeof additional === 'object') {
    fail(pointer, 'declared members and a schema in "additionalProperties" cannot be combined.');
  }
  const pad = '  '.repeat(depth + 1);
  const end = '  '.repeat(depth);
  const typeLines = [];
  const zodLines = [];
  for (const [name, property] of properties) {
    const member = convertSchema(property, `${pointer}/properties/${name}`, depth + 1);
    const optional = !required.includes(name);
    typeLines.push(
      `${docblock(property, pad)}${pad}${propertyName(name)}${optional ? '?' : ''}: ${member.type};`,
    );
    zodLines.push(`${pad}${propertyName(name)}: ${member.zod}${optional ? '.optional()' : ''},`);
  }
  // An unknown member is dropped unless the schema says otherwise, so that a consumer built on an
  // older version of the contract still reads an event that gained an optional member.
  if (additional === true) typeLines.push(`${pad}[key: string]: unknown;`);
  const factory =
    additional === true
      ? 'zod.looseObject'
      : additional === false
        ? 'zod.strictObject'
        : 'zod.object';
  return {
    type: `{\n${typeLines.join('\n')}\n${end}}`,
    zod: `${factory}({\n${zodLines.join('\n')}\n${end}})`,
  };
}

/**
 * Converts one schema. References are expected to be resolved already.
 *
 * @param {Record<string, unknown>} schema JSON Schema to convert.
 * @param {string} pointer Place of the schema in its document, for error messages.
 * @param {number} [depth] Nesting level, which sets the indentation of the written code.
 * @returns {Converted} The TypeScript type and the zod expression.
 */
export function convertSchema(schema, pointer, depth = 0) {
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    fail(pointer, 'a schema must be an object.');
  }
  if ('$ref' in schema) fail(pointer, 'the reference was not resolved before the conversion.');
  if ('allOf' in schema) {
    fail(
      pointer,
      'the event generator does not support "allOf": declare the members on the schema itself.',
    );
  }

  const alternatives = schema.oneOf ?? schema.anyOf;
  if (alternatives !== undefined) {
    assertKeywords(schema, 'union', pointer);
    if ('oneOf' in schema && 'anyOf' in schema) fail(pointer, 'use "oneOf" or "anyOf", not both.');
    if (!Array.isArray(alternatives) || alternatives.length < 2) {
      fail(pointer, 'a union needs at least two alternatives.');
    }
    const keyword = 'oneOf' in schema ? 'oneOf' : 'anyOf';
    const members = alternatives.map((alternative, index) =>
      convertSchema(alternative, `${pointer}/${keyword}/${String(index)}`, depth),
    );
    return {
      type: members.map((member) => member.type).join(' | '),
      zod: `zod.union([${members.map((member) => member.zod).join(', ')}])`,
    };
  }

  const types = schema.type === undefined ? [] : [schema.type].flat();
  const nullable = types.includes('null');
  const kinds = types.filter((type) => type !== 'null');
  if (kinds.length > 1) fail(pointer, 'several types on one schema: use "oneOf".');
  const kind = kinds[0];

  let converted;
  if ('const' in schema || 'enum' in schema) {
    converted = convertLiteral(schema, pointer);
    // `null` listed among the values already makes the literal nullable.
    if (schema.const === null || schema.enum?.includes(null)) return converted;
  } else if (kind === 'string') {
    converted = convertString(schema, pointer);
  } else if (kind === 'integer' || kind === 'number') {
    converted = convertNumber(schema, pointer, kind === 'integer');
  } else if (kind === 'boolean') {
    assertKeywords(schema, 'boolean', pointer);
    converted = { type: 'boolean', zod: 'zod.boolean()' };
  } else if (kind === 'array') {
    converted = convertArray(schema, pointer, depth);
  } else if (kind === 'object') {
    converted = convertObject(schema, pointer, depth);
  } else if (kind === undefined && nullable) {
    assertKeywords(schema, 'null', pointer);
    return { type: 'null', zod: 'zod.null()' };
  } else {
    return fail(
      pointer,
      kind === undefined ? 'a schema needs a "type".' : `unknown type "${String(kind)}".`,
    );
  }

  return nullable
    ? { type: `${converted.type} | null`, zod: `${converted.zod}.nullable()` }
    : converted;
}

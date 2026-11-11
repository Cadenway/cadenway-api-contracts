import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createWorkspace, listTree, repoRoot, runNode } from './support';

const FIXTURES = ['--openapi', 'test/fixtures/openapi', '--asyncapi', 'test/fixtures/asyncapi'];

/** The part of a zod schema these tests rely on. */
interface Validator {
  safeParse(value: unknown): { success: boolean };
}

const workspaces: string[] = [];

/** Creates a workspace that is removed after the tests of this file. */
function workspace(): string {
  const directory = createWorkspace();
  workspaces.push(directory);
  return directory;
}

/** Reads every file below a directory, by relative path. */
function readTree(directory: string): Record<string, string> {
  return Object.fromEntries(
    listTree(directory).map((file) => [file, readFileSync(path.join(directory, file), 'utf8')]),
  );
}

afterAll(() => {
  for (const directory of workspaces) rmSync(directory, { recursive: true, force: true });
});

describe('generate on the fixtures', () => {
  let out: string;
  let contracts: string;
  let client: string;

  beforeAll(() => {
    out = workspace();
    contracts = path.join(out, 'contracts');
    client = path.join(out, 'api-client');
    const result = runNode('scripts/generate.mjs', [...FIXTURES, '--out', out]);
    expect(result.output).toContain('3 OpenAPI document(s), 1 AsyncAPI document(s)');
    expect(result.status).toBe(0);
  });

  it('writes one types, one validators and one events module per document', () => {
    expect(listTree(path.join(contracts, 'src', 'generated'))).toEqual([
      'events/widget-service.ts',
      'types/internal/widget-service.ts',
      'types/public/gadgets.ts',
      'types/public/widgets.ts',
      'validators/internal/widget-service.ts',
      'validators/public/gadgets.ts',
      'validators/public/widgets.ts',
    ]);
  });

  it('generates Angular services for the public documents only', () => {
    const generated = listTree(path.join(client, 'src', 'generated'));
    expect(generated).toContain('widgets/widgets.ts');
    expect(generated).toContain('gadgets/gadgets.ts');
    expect(generated.filter((file) => file.startsWith('widget-service/'))).toEqual([]);
  });

  it('exports every generated declaration by name from the public API', () => {
    const publicApi = readFileSync(path.join(client, 'src', 'public-api.ts'), 'utf8');
    expect(publicApi).toContain("export { WidgetsService } from './generated/widgets/widgets';");
    expect(publicApi).toContain("export { GadgetsService } from './generated/gadgets/gadgets';");
    expect(publicApi).toContain("export type { Widget } from './generated/widgets/model/widget';");
    expect(publicApi).not.toMatch(/export\s+\*/);
  });

  it('exports once a name that two public documents declare identically', () => {
    const publicApi = readFileSync(path.join(client, 'src', 'public-api.ts'), 'utf8');
    expect(publicApi.match(/export type \{ Error \}/g)).toHaveLength(1);
  });

  it('produces zod validators that accept a valid response and refuse an invalid one', async () => {
    const file = path.join(contracts, 'src', 'generated', 'validators', 'public', 'widgets.ts');
    const validators = (await import(pathToFileURL(file).href)) as Record<string, Validator>;
    const page = {
      items: [{ id: 'wid-1', name: 'Left gear', color: 'red', createdAt: '2026-01-15T09:30:00Z' }],
      nextCursor: null,
    };

    expect(validators['ListWidgetsResponse']?.safeParse(page).success).toBe(true);
    expect(validators['ListWidgetsResponse']?.safeParse({ ...page, nextCursor: 42 }).success).toBe(
      false,
    );
    expect(validators['CreateWidgetBody']?.safeParse({ name: '' }).success).toBe(false);
  });

  it('lists the event names and types the payload of each event', async () => {
    const file = path.join(contracts, 'src', 'generated', 'events', 'widget-service.ts');
    const events = (await import(pathToFileURL(file).href)) as { eventNames: readonly string[] };
    const source = readFileSync(file, 'utf8');

    expect(events.eventNames).toEqual(['widget.created.v1']);
    expect(source).toContain("'widget.created.v1': WidgetCreatedV1;");
    expect(source).toContain('export interface WidgetCreatedV1 {');
    expect(source).not.toContain('additionalProperties');
  });

  it('compiles under the compiler options of each package', () => {
    writeFileSync(
      path.join(contracts, 'tsconfig.json'),
      JSON.stringify({
        extends: path.join(repoRoot, 'packages', 'contracts', 'tsconfig.json'),
        compilerOptions: { noEmit: true, rootDir: 'src' },
        include: ['src/**/*.ts'],
      }),
    );
    writeFileSync(
      path.join(client, 'tsconfig.lib.json'),
      JSON.stringify({
        extends: path.join(repoRoot, 'packages', 'api-client', 'tsconfig.lib.json'),
        include: ['src/**/*.ts'],
      }),
    );

    const typesAndValidators = runNode('node_modules/typescript/bin/tsc', [
      '-p',
      path.join(contracts, 'tsconfig.json'),
    ]);
    const services = runNode('node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', [
      '--noEmit',
      '-p',
      path.join(client, 'tsconfig.lib.json'),
    ]);

    expect(typesAndValidators.output).toBe('');
    expect(typesAndValidators.status).toBe(0);
    expect(services.output).toBe('');
    expect(services.status).toBe(0);
  });

  it('builds as an Angular library with ng-packagr', () => {
    cpSync(
      path.join(repoRoot, 'packages', 'api-client', 'package.json'),
      path.join(client, 'package.json'),
    );
    writeFileSync(
      path.join(client, 'ng-package.json'),
      JSON.stringify({ dest: 'dist', lib: { entryFile: 'src/public-api.ts' } }),
    );
    writeFileSync(
      path.join(client, 'tsconfig.lib.prod.json'),
      JSON.stringify({
        extends: path.join(repoRoot, 'packages', 'api-client', 'tsconfig.lib.prod.json'),
        include: ['src/**/*.ts'],
      }),
    );

    const result = runNode('node_modules/ng-packagr/src/cli/main.js', [
      '-p',
      path.join(client, 'ng-package.json'),
      '-c',
      path.join(client, 'tsconfig.lib.prod.json'),
    ]);
    const bundle = path.join(client, 'dist', 'fesm2022', 'waypoint-api-client.mjs');
    const typings = path.join(client, 'dist', 'types', 'waypoint-api-client.d.ts');

    expect(result.status, result.output).toBe(0);
    expect(readFileSync(bundle, 'utf8')).toContain('class WidgetsService');
    expect(readFileSync(typings, 'utf8')).toContain('export declare class GadgetsService');
  });

  it('writes the same files on a second run', () => {
    const second = workspace();
    const result = runNode('scripts/generate.mjs', [...FIXTURES, '--out', second]);

    expect(result.status).toBe(0);
    expect(readTree(path.join(second, 'contracts', 'src'))).toEqual(
      readTree(path.join(contracts, 'src')),
    );
    expect(readTree(path.join(second, 'api-client', 'src'))).toEqual(
      readTree(path.join(client, 'src')),
    );
  });
});

describe('generate without any spec', () => {
  it('writes an empty public API and no generated folder', () => {
    const out = workspace();
    const empty = path.join(out, 'no-spec');
    mkdirSync(empty);

    const result = runNode('scripts/generate.mjs', [
      '--openapi',
      empty,
      '--asyncapi',
      empty,
      '--out',
      out,
    ]);

    expect(result.status).toBe(0);
    expect(readFileSync(path.join(out, 'api-client', 'src', 'public-api.ts'), 'utf8')).toMatch(
      /\*\/\nexport \{\};\n$/,
    );
    expect(existsSync(path.join(out, 'api-client', 'src', 'generated'))).toBe(false);
    expect(existsSync(path.join(out, 'contracts', 'src', 'generated'))).toBe(false);
  });
});

describe('generate on documents it must refuse', () => {
  /** Copies the fixtures, rewrites one of them, and runs the generator on the copy. */
  function generateWith(file: string, search: string, replacement: string) {
    const out = workspace();
    const specs = path.join(out, 'specs');
    cpSync(path.join(repoRoot, 'test', 'fixtures'), specs, { recursive: true });
    const target = path.join(specs, file);
    const original = readFileSync(target, 'utf8');
    expect(original).toContain(search);
    writeFileSync(target, original.replace(search, replacement));

    return runNode('scripts/generate.mjs', [
      '--openapi',
      path.join(specs, 'openapi'),
      '--asyncapi',
      path.join(specs, 'asyncapi'),
      '--out',
      out,
    ]);
  }

  it('stops when two public documents declare the same name differently', () => {
    const result = generateWith(
      'openapi/public/gadgets.yaml',
      '          additionalProperties: true',
      '          additionalProperties:\n            type: string',
    );

    expect(result.status).not.toBe(0);
    expect(result.output).toContain('"ErrorDetails" is declared differently');
  });

  it('stops on an AsyncAPI version the event generator cannot read', () => {
    const result = generateWith(
      'asyncapi/widget-service.yaml',
      'asyncapi: 3.0.0',
      'asyncapi: 3.1.0',
    );

    expect(result.status).not.toBe(0);
    expect(result.output).toContain('asyncapi 3.1.0 is not supported');
  });

  it('stops on an inline event schema, which would get an unstable name', () => {
    const result = generateWith(
      'asyncapi/widget-service.yaml',
      "        color:\n          $ref: '#/components/schemas/WidgetColor'",
      '        color:\n          type: string\n          enum:\n            - red\n            - green',
    );

    expect(result.status).not.toBe(0);
    expect(result.output).toContain('move it to components/schemas');
  });
});

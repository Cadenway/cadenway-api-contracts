/** Postprocess Orval validators to preserve published behavior and enforce documented contracts. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dereference } from './lib/dereference.mjs';
import { ROOTS, listYaml } from './lib/roots.mjs';

for (const root of ROOTS) {
  for (const spec of listYaml(root.openapi)) {
    const source = `${root.openapi}/${spec}.yaml`;
    const document = dereference(source, process.cwd());
    const target = `${root.contracts}/validators/${spec}.ts`;
    let generated = readFileSync(target, 'utf8');
    for (const path of Object.values(document.paths ?? {})) {
      for (const operation of Object.values(path)) {
        if (!operation?.operationId) continue;
        const parameters = new Map(
          [...(path.parameters ?? []), ...(operation.parameters ?? [])]
            .filter((parameter) => parameter.in === 'query')
            .map((parameter) => [parameter.name, parameter]),
        );
        const booleanParameters = [...parameters.values()].filter(
          (parameter) =>
            parameter.schema?.type === 'boolean' ||
            (Array.isArray(parameter.schema?.type) && parameter.schema.type.includes('boolean')),
        );
        if (booleanParameters.length > 0) {
          const name = `${operation.operationId[0].toUpperCase()}${operation.operationId.slice(1)}QueryParams`;
          const start = generated.indexOf(`export const ${name} = zod.object({`);
          const next = generated.indexOf('\nexport const ', start + 1);
          if (start < 0) throw new Error(`${source}: missing query validator ${name}`);
          const end = next < 0 ? generated.length : next;
          let query = generated.slice(start, end);
          for (const parameter of booleanParameters) {
            const original = `  ${JSON.stringify(parameter.name)}: zod.boolean()`;
            if (!query.includes(original))
              throw new Error(`${source}: missing boolean query ${name}.${parameter.name}`);
            query = query.replace(
              original,
              `  ${JSON.stringify(parameter.name)}: zod.preprocess((value) => value === 'true' ? true : value === 'false' ? false : value, zod.boolean())`,
            );
          }
          generated = generated.slice(0, start) + query + generated.slice(end);
        }
        if (operation['x-cadenway-strict-empty'] !== true) continue;
        const schema = operation.requestBody?.content?.['application/json']?.schema;
        if (
          schema?.type !== 'object' ||
          schema.additionalProperties !== false ||
          Object.keys(schema.properties ?? {}).length !== 0
        )
          throw new Error(`${source}: strict empty marker requires a closed empty body`);
        const name = `${operation.operationId[0].toUpperCase()}${operation.operationId.slice(1)}Body`;
        const pattern = new RegExp(`(export const ${name} = )zod\\.object\\(\\{\\s*\\}\\)`);
        if (!pattern.test(generated)) throw new Error(`${source}: missing empty validator ${name}`);
        generated = generated.replace(pattern, '$1zod.strictObject({})');
      }
    }
    // Orval's zod max counts UTF-16 units; JSON Schema string length counts Unicode code points.
    if (
      root.name === 'contracts' &&
      (spec === 'public/tasks' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/tasks' ? '' : 'Internal';
      for (const operation of ['createTaskComment', 'updateTaskComment']) {
        const name = `${operation}${suffix}BodyBodyMax`;
        const original = `.max(${name})`;
        if (!generated.includes(original))
          throw new Error(`${source}: missing comment length check ${name}`);
        generated = generated.replace(
          original,
          `.refine((value) => Array.from(value).length <= ${name}, { message: 'At most 5000 Unicode code points' })`,
        );
      }
    }
    // Orval flattens allOf but loses the const true on milestone page items.
    if (
      root.name === 'contracts' &&
      (spec === 'public/spaces' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/spaces' ? '' : 'Internal';
      const name = `ListSpaceMilestones${suffix}Response`;
      const original = `export const ${name} = zod.object({\n  "items": zod.array(zod.object({\n  "milestone": zod.boolean()`;
      if (!generated.includes(original))
        throw new Error(`${source}: missing milestone response ${name}`);
      generated = generated.replace(
        original,
        original.replace('zod.boolean()', 'zod.literal(true)'),
      );
    }
    // Bulk selection and action objects are closed, and keys must be unique even across versions.
    if (
      root.name === 'contracts' &&
      (spec === 'public/tasks' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/tasks' ? '' : 'Internal';
      const name = `ExecuteBulkTaskAction${suffix}Body`;
      const start = generated.indexOf(`export const ${name} = zod.object({`);
      const end = generated.indexOf('\nexport const ', start + 1);
      if (start < 0 || end < 0)
        throw new Error(`${source}: missing bulk request validator ${name}`);
      let body = generated.slice(start, end).replaceAll('zod.object({', 'zod.strictObject({');
      const original = "}).describe('One atomic action over 1 to 50 distinct task keys.";
      if (!body.includes(original))
        throw new Error(`${source}: missing bulk request description ${name}`);
      body = body.replace(
        original,
        "}).refine((value) => new Set(value.selection.map((entry) => entry.taskKey)).size === value.selection.length, { path: ['selection'], message: 'Task keys must be distinct' }).describe('One atomic action over 1 to 50 distinct task keys.",
      );
      generated = generated.slice(0, start) + body + generated.slice(end);
    }
    // Saved names use JSON Schema code-point length, not UTF-16 code units.
    if (
      root.name === 'contracts' &&
      ['public/spaces', 'public/lists', 'internal/task-service'].includes(spec)
    ) {
      const operations =
        spec === 'public/spaces'
          ? ['createTaskTemplate']
          : spec === 'public/lists'
            ? ['createSavedView', 'updateSavedView']
            : ['createTaskTemplateInternal', 'createSavedViewInternal', 'updateSavedViewInternal'];
      for (const operation of operations) {
        const name = `${operation}BodyNameMax`;
        const original = `.max(${name})`;
        if (!generated.includes(original))
          throw new Error(`${source}: missing saved name length ${name}`);
        generated = generated.replace(
          original,
          `.refine((value) => Array.from(value).length <= ${name}, { message: 'At most 80 Unicode code points' })`,
        );
      }
    }
    writeFileSync(target, generated);
  }
}

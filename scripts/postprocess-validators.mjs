/** Postprocess Orval validators to preserve published behavior and enforce documented contracts. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dereference } from './lib/dereference.mjs';
import { ROOTS, listYaml } from './lib/roots.mjs';

// Use the authored component for both request and response map keys.
const customFieldSchemas = dereference('components/task.yaml', process.cwd()).components.schemas;
const customFieldIdPattern = customFieldSchemas.CustomFieldId.pattern;
const customFieldPatch = customFieldSchemas.TaskCustomFieldValuesPatch;
const attachmentSchemas = dereference('components/attachments.yaml', process.cwd()).components
  .schemas;
const mediaSchemas = dereference('components/profile-media.yaml', process.cwd()).components.schemas;

const signedUploadOperations = {
  'public/attachments': ['StartTaskAttachmentUpload'],
  'public/intake': ['StartPublicIntakeAttachmentUpload'],
  'internal/storage-service': [
    'StartTaskAttachmentUploadInternal',
    'StartIntakeAttachmentUploadInternal',
  ],
};
const closedIntakeResponses = {
  'public/intake': ['CompletePublicIntakeAttachmentUpload'],
  'internal/task-service': ['AllocateIntakeAttachmentInternal', 'ResolveIntakeAttachmentInternal'],
  'internal/storage-service': ['CompleteIntakeAttachmentUploadInternal'],
};

for (const root of ROOTS) {
  for (const spec of listYaml(root.openapi)) {
    const source = `${root.openapi}/${spec}.yaml`;
    const document = dereference(source, process.cwd());
    const target = `${root.contracts}/validators/${spec}.ts`;
    let generated = readFileSync(target, 'utf8');
    for (const path of Object.values(document.paths ?? {})) {
      for (const operation of Object.values(path)) {
        if (!operation?.operationId) continue;
        // Orval emits unknown for a textual response even when its schema is a plain string.
        const successResponses = Object.entries(operation.responses ?? {})
          .filter(([status]) => /^2\d\d$/.test(status))
          .map(([, response]) => response);
        const textResponses = successResponses.flatMap((response) =>
          Object.entries(response.content ?? {}),
        );
        const hasOnlyPlainTextResponses =
          successResponses.length > 0 &&
          successResponses.every((response) => Object.keys(response.content ?? {}).length > 0) &&
          textResponses.every(([mediaType, content]) => {
            const schema = content.schema;
            return (
              mediaType.toLowerCase().startsWith('text/') &&
              schema?.type === 'string' &&
              Object.keys(schema).every((key) =>
                ['type', 'description', 'title', 'example', 'examples'].includes(key),
              )
            );
          });
        if (hasOnlyPlainTextResponses) {
          const name = `${operation.operationId[0].toUpperCase()}${operation.operationId.slice(1)}Response`;
          const original = `export const ${name} = zod.unknown()`;
          if (generated.includes(original)) {
            generated = generated.replace(original, `export const ${name} = zod.string()`);
          }
        }
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
        const strictEmpty = operation['x-cadenway-strict-empty'] === true;
        if (!strictEmpty && operation['x-cadenway-strict-body'] !== true) continue;
        const schema = operation.requestBody?.content?.['application/json']?.schema;
        const alternatives = schema?.oneOf ?? [schema];
        if (
          alternatives.length === 0 ||
          alternatives.some(
            (item) => item?.type !== 'object' || item.additionalProperties !== false,
          ) ||
          (strictEmpty && (schema.oneOf || Object.keys(schema.properties ?? {}).length !== 0))
        )
          throw new Error(`${source}: strict body marker requires a matching closed object`);
        const name = `${operation.operationId[0].toUpperCase()}${operation.operationId.slice(1)}Body`;
        if (strictEmpty) {
          const pattern = new RegExp(`(export const ${name} = )zod\\.object\\(\\{\\s*\\}\\)`);
          if (!pattern.test(generated))
            throw new Error(`${source}: missing empty validator ${name}`);
          generated = generated.replace(pattern, '$1zod.strictObject({})');
          continue;
        }
        const declaration = `export const ${name} = `;
        if (schema.oneOf) {
          const start = generated.indexOf(declaration);
          const next = generated.indexOf('\nexport const ', start + declaration.length);
          const end = next < 0 ? generated.length : next;
          const body = generated.slice(start, end);
          if (start < 0 || body.match(/zod\.object\(\{/g)?.length !== alternatives.length)
            throw new Error(`${source}: missing flat union body validator ${name}`);
          generated =
            generated.slice(0, start) +
            body.replaceAll('zod.object({', 'zod.strictObject({') +
            generated.slice(end);
          continue;
        }
        const object = declaration + 'zod.object({';
        if (!generated.includes(object))
          throw new Error(`${source}: missing body validator ${name}`);
        generated = generated.replace(object, declaration + 'zod.strictObject({');
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
      // Orval strips extra fields on nonempty closed objects. Onboarding writes must refuse
      // fields owned by the server, including the first-task marker and provisioning IDs.
      for (const operation of [
        'UpdateOnboarding',
        'UpdateOnboardingChecklist',
        'FinishOnboarding',
      ]) {
        const name = `${operation}${suffix}Body`;
        const original = `export const ${name} = zod.object({`;
        const strict = `export const ${name} = zod.strictObject({`;
        if (!generated.includes(original) && !generated.includes(strict))
          throw new Error(`${source}: missing onboarding request validator ${name}`);
        generated = generated.replace(original, strict);
      }
    }
    // Time-entry input is closed and its note length counts Unicode code points.
    if (root.name === 'contracts' && ['public/time', 'internal/task-service'].includes(spec)) {
      const operation =
        spec === 'public/time' ? 'createTaskTimeEntry' : 'createTaskTimeEntryInternal';
      const body = `export const ${operation[0].toUpperCase()}${operation.slice(1)}Body = `;
      const object = body + 'zod.object({';
      const length = `.max(${operation}BodyNoteMax)`;
      if (!generated.includes(object) || !generated.includes(length)) {
        throw new Error(`${source}: missing time-entry body or note length check`);
      }
      generated = generated
        .replace(object, body + 'zod.strictObject({')
        .replace(
          length,
          `.refine((value) => Array.from(value).length <= ${operation}BodyNoteMax, { message: 'At most 500 Unicode code points' })`,
        );
    }
    // Reminder notes count Unicode code points on both requests and responses.
    if (
      root.name === 'contracts' &&
      ['public/reminders', 'internal/notification-service'].includes(spec)
    ) {
      const suffix = spec === 'public/reminders' ? '' : 'Internal';
      const limits = [
        spec === 'public/reminders'
          ? 'listRemindersResponseItemsItemNoteMax'
          : 'listVisibleReminderRecordsInternalResponseItemsItemNoteMax',
        `getTaskReminder${suffix}ResponseNoteMax`,
        `setTaskReminder${suffix}BodyNoteMax`,
        `setTaskReminder${suffix}ResponseNoteMax`,
        `getReminder${suffix}ResponseNoteMax`,
        `updateReminderNote${suffix}BodyNoteMax`,
        `updateReminderNote${suffix}ResponseNoteMax`,
        `snoozeReminder${suffix}ResponseNoteMax`,
        `completeReminder${suffix}ResponseNoteMax`,
      ];
      for (const limit of limits) {
        const original = `zod.string().max(${limit})`;
        if (!generated.includes(original))
          throw new Error(`${source}: missing reminder note length ${limit}`);
        generated = generated.replace(
          original,
          `zod.string().refine((value) => Array.from(value).length <= ${limit}, { message: 'At most 500 Unicode code points' })`,
        );
      }
    }
    // Notification inputs are closed, including each subject and preference branch.
    if (
      root.name === 'contracts' &&
      ['public/inbox', 'public/reminders', 'internal/notification-service'].includes(spec)
    ) {
      const operations =
        spec === 'public/inbox'
          ? ['UpdateNotificationPreferences']
          : spec === 'public/reminders'
            ? ['SetTaskReminder', 'UpdateReminderNote', 'SnoozeReminder']
            : [
                'MarkInboxNotificationsReadInternal',
                'MarkInboxNotificationReadInternal',
                'ArchiveInboxNotificationInternal',
                'UpdateNotificationPreferencesInternal',
                'ListVisibleReminderRecordsInternal',
                'SetTaskReminderInternal',
                'UpdateReminderNoteInternal',
                'SnoozeReminderInternal',
              ];
      for (const operation of operations) {
        const name = `${operation}Body`;
        const start = generated.indexOf(`export const ${name} = `);
        const end = generated.indexOf('\nexport const ', start + 1);
        if (start < 0 || end < 0) throw new Error(`${source}: missing notification body ${name}`);
        let body = generated.slice(start, end).replaceAll('zod.object({', 'zod.strictObject({');
        if (operation === 'MarkInboxNotificationsReadInternal') {
          const original = `).describe('Exact non-null unread subjects permitted by Task for this attempt.')`;
          if (!body.includes(original)) throw new Error(`${source}: missing authorized subjects`);
          body = body.replace(
            original,
            `).refine((items) => new Set(items.map((item) => JSON.stringify(item))).size === items.length, { message: 'Subjects must be unique' }).describe('Exact non-null unread subjects permitted by Task for this attempt.')`,
          );
        }
        if (operation === 'ListVisibleReminderRecordsInternal') {
          const original = '.max(listVisibleReminderRecordsInternalBodyItemsMax)';
          if (!body.includes(original)) throw new Error(`${source}: missing reminder selection`);
          body = body.replace(
            original,
            `${original}.refine((items) => new Set(items.map((item) => JSON.stringify(item))).size === items.length, { message: 'Reminder references must be unique' })`,
          );
        }
        generated = generated.slice(0, start) + body + generated.slice(end);
      }
    }
    if (root.name === 'contracts' && spec === 'internal/task-service') {
      const name = 'ResolveNotificationSubjectsInternalBody';
      const start = generated.indexOf(`export const ${name} = `);
      const end = generated.indexOf('\nexport const ', start + 1);
      if (start < 0 || end < 0) throw new Error(`${source}: missing notification subject lookup`);
      const body = generated.slice(start, end).replaceAll('zod.object({', 'zod.strictObject({');
      generated = generated.slice(0, start) + body + generated.slice(end);
      const limit =
        'resolveNotificationSubjectsInternalResponseResultsItemTwoDisplayCommentExcerptMax';
      const excerpt = `.max(${limit})`;
      if (!generated.includes(excerpt)) throw new Error(`${source}: missing comment excerpt limit`);
      generated = generated.replace(
        excerpt,
        `.refine((value) => Array.from(value).length <= ${limit}, { message: 'At most 200 Unicode code points' })`,
      );
    }
    // Intake writes must refuse unknown routing, identity, and field settings at the boundary.
    if (root.name === 'contracts' && ['public/intake', 'internal/task-service'].includes(spec)) {
      const suffix = spec === 'public/intake' ? '' : 'Internal';
      for (const operation of ['UpdateIntakeFormConfiguration', 'SubmitPublicIntakeForm']) {
        const name = `${operation}${suffix}Body`;
        const start = generated.indexOf(`export const ${name} = zod.object({`);
        const end = generated.indexOf('\nexport const ', start + 1);
        if (start < 0 || end < 0)
          throw new Error(`${source}: missing intake request validator ${name}`);
        let body = generated.slice(start, end);
        if (
          operation === 'UpdateIntakeFormConfiguration' &&
          !body.includes('"fields": zod.object({')
        )
          throw new Error(`${source}: missing intake field settings validator ${name}`);
        if (operation === 'SubmitPublicIntakeForm') {
          const maxItems = `.max(submitPublicIntakeForm${suffix}BodyAttachmentIdsMax)`;
          if (!body.includes(maxItems))
            throw new Error(`${source}: missing intake attachment array validator ${name}`);
          // Orval omits uniqueItems. UUID comparison must also ignore case.
          body = body.replace(
            maxItems,
            `${maxItems}.refine((value) => new Set(value.map((id) => id.toLowerCase())).size === value.length, { message: 'Attachment IDs must be distinct' })`,
          );
        }
        generated =
          generated.slice(0, start) +
          body.replaceAll('zod.object({', 'zod.strictObject({') +
          generated.slice(end);
      }
    }
    // Reviewer IDs identify accounts, so differently cased UUIDs must not name the same reviewer.
    if (
      root.name === 'contracts' &&
      (spec === 'public/tasks' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/tasks' ? '' : 'Internal';
      const requestName = `RequestTaskApproval${suffix}Body`;
      const requestStart = generated.indexOf(`export const ${requestName} = zod.object({`);
      const requestEnd = generated.indexOf('\nexport const ', requestStart + 1);
      if (requestStart < 0 || requestEnd < 0)
        throw new Error(`${source}: missing approval request validator ${requestName}`);
      let request = generated.slice(requestStart, requestEnd);
      request = request.replace('zod.object({', 'zod.strictObject({');
      const requestClose = request.lastIndexOf('})');
      if (requestClose < 0) throw new Error(`${source}: missing approval request body close`);
      request =
        request.slice(0, requestClose) +
        `}).refine((value) => new Set(value.reviewerUserIds.map((id) => id.toLowerCase())).size === value.reviewerUserIds.length, { path: ['reviewerUserIds'], message: 'Reviewer IDs must be distinct' })` +
        request.slice(requestClose + 2);
      generated = generated.slice(0, requestStart) + request + generated.slice(requestEnd);

      const voteName = `VoteOnTaskApproval${suffix}Body`;
      const voteStart = generated.indexOf(`export const ${voteName} = zod.union([`);
      const voteEnd = generated.indexOf('\nexport const ', voteStart + 1);
      if (voteStart < 0 || voteEnd < 0)
        throw new Error(`${source}: missing approval vote validator ${voteName}`);
      let vote = generated
        .slice(voteStart, voteEnd)
        .replaceAll('zod.object({', 'zod.strictObject({');
      const limit = `voteOnTaskApproval${suffix}BodyTwoReasonMax`;
      const lengthCheck = `.max(${limit})`;
      if (!vote.includes(lengthCheck))
        throw new Error(`${source}: missing approval reason length ${voteName}`);
      vote = vote.replace(
        lengthCheck,
        `.refine((value) => Array.from(value).length <= ${limit}, { message: 'At most 5000 Unicode code points' })`,
      );
      generated = generated.slice(0, voteStart) + vote + generated.slice(voteEnd);
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
    // Orval omits propertyNames, maxProperties and additionalProperties on these schemas.
    if (root.name === 'contracts') {
      const mapKey = `zod.string().regex(new RegExp(${JSON.stringify(customFieldIdPattern)}))`;
      const outputMap =
        '"customFieldValues": zod.record(zod.string(), zod.union([zod.number(),zod.string()]))';
      generated = generated.replaceAll(
        outputMap,
        outputMap.replace('zod.record(zod.string(),', `zod.record(${mapKey},`),
      );

      if (spec === 'public/tasks' || spec === 'internal/task-service') {
        const suffix = spec === 'public/tasks' ? '' : 'Internal';
        const name = `UpdateTask${suffix}Body`;
        const maxName = `updateTask${suffix}BodyCustomFieldValuesTwoMax`;
        const original = `"customFieldValues": zod.record(zod.string(), zod.union([zod.number(),zod.string().max(${maxName}),zod.null()]))`;
        if (!generated.includes(original))
          throw new Error(`${source}: missing custom field patch validator ${name}`);
        const replacement = `"customFieldValues": zod.record(${mapKey}, zod.union([zod.number(),zod.string().refine((value) => Array.from(value).length <= ${maxName}, { message: 'At most ${customFieldPatch.additionalProperties.oneOf[1].maxLength} Unicode code points' }),zod.null()])).refine((value) => Object.keys(value).length <= ${customFieldPatch.maxProperties}, { message: 'At most ${customFieldPatch.maxProperties} custom fields' })`;
        generated = generated.replace(original, replacement);
      }

      if (spec === 'public/spaces' || spec === 'internal/task-service') {
        const suffix = spec === 'public/spaces' ? '' : 'Internal';
        for (const operation of ['CreateSpaceCustomField', 'UpdateSpaceCustomField']) {
          const name = `${operation}${suffix}Body`;
          const original = `export const ${name} = zod.object({`;
          if (!generated.includes(original))
            throw new Error(`${source}: missing custom field definition validator ${name}`);
          generated = generated.replace(
            original,
            original.replace('zod.object', 'zod.strictObject'),
          );
          const limit = `${operation[0].toLowerCase()}${operation.slice(1)}${suffix}BodyNameMax`;
          const lengthCheck = `.max(${limit})`;
          if (!generated.includes(lengthCheck))
            throw new Error(`${source}: missing custom field name limit ${name}`);
          generated = generated.replace(
            lengthCheck,
            `.refine((value) => Array.from(value).length <= ${limit}, { message: 'At most 80 Unicode code points' })`,
          );
        }
      }
    }
    // Goal request objects and each nested result have closed schemas.
    if (
      root.name === 'contracts' &&
      (spec === 'public/goals' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/goals' ? '' : 'Internal';
      for (const operation of [
        'CreateGoal',
        'UpdateGoal',
        'CreateGoalResult',
        'UpdateGoalResult',
      ]) {
        const name = `${operation}${suffix}Body`;
        const start = generated.indexOf(`export const ${name} = `);
        const end = generated.indexOf('\nexport const ', start + 1);
        if (start < 0 || end < 0)
          throw new Error(`${source}: missing goal request validator ${name}`);
        const body = generated.slice(start, end);
        if (!body.includes('zod.object({'))
          throw new Error(`${source}: missing goal request objects ${name}`);
        generated =
          generated.slice(0, start) +
          body.replaceAll('zod.object({', 'zod.strictObject({') +
          generated.slice(end);
      }
    }
    // HTTP query strings carry numeric dashboard options as text.
    if (
      root.name === 'contracts' &&
      (spec === 'public/reports' || spec === 'internal/task-service')
    ) {
      const suffix = spec === 'public/reports' ? '' : 'Internal';
      const name = `GetTeamDashboard${suffix}QueryParams`;
      const defaultName = `getTeamDashboard${suffix}QueryWeeksDefault`;
      const start = generated.indexOf(`export const ${name} = zod.object({`);
      const end = generated.indexOf('\nexport const ', start + 1);
      if (start < 0 || end < 0)
        throw new Error(`${source}: missing dashboard query validator ${name}`);
      let query = generated.slice(start, end);
      const union = 'zod.union([zod.literal(8),zod.literal(12)])';
      const weeksWithDefault = `${union}.default(${defaultName})`;
      const weeksWithoutDefault = `${union}.optional()`;
      const weeks = query.includes(weeksWithDefault) ? weeksWithDefault : weeksWithoutDefault;
      if (!query.includes(weeks))
        throw new Error(`${source}: missing dashboard weeks validator ${name}`);
      const operationId = `getTeamDashboard${suffix}`;
      const operation = Object.values(document.paths ?? {})
        .flatMap((path) => Object.values(path))
        .find((entry) => entry?.operationId === operationId);
      const defaultWeeks = operation?.parameters?.find((parameter) => parameter.name === 'weeks')
        ?.schema?.default;
      if (defaultWeeks !== 8) throw new Error(`${source}: missing dashboard weeks default`);
      const validatedWeeks =
        weeks === weeksWithDefault ? weeksWithDefault : `${union}.default(${defaultWeeks})`;
      query = query.replace(
        weeks,
        `zod.preprocess((value) => value === '8' ? 8 : value === '12' ? 12 : value, ${validatedWeeks})`,
      );
      generated = generated.slice(0, start) + query + generated.slice(end);
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
    if (root.name === 'contracts' && spec === 'internal/task-service') {
      const query = 'export const CheckTaskAttachmentAccessInternalQueryParams = zod.object({';
      if (!generated.includes(query)) throw new Error(`${source}: missing attachment access query`);
      generated = generated.replace(query, query.replace('zod.object', 'zod.strictObject'));
    }
    if (root.name === 'contracts') {
      const signedUploads = signedUploadOperations[spec] ?? [];
      const declarations =
        spec === 'internal/task-service' ? ['AllocateIntakeAttachmentInternal'] : signedUploads;
      for (const operation of declarations) {
        const body = `export const ${operation}Body = zod.object({`;
        if (!generated.includes(body))
          throw new Error(`${source}: missing ${operation} body validator`);
        generated = generated.replace(body, body.replace('zod.object', 'zod.strictObject'));
      }

      for (const operation of signedUploads) {
        const response = `export const ${operation}Response = `;
        const start = generated.indexOf(response);
        const next = generated.indexOf('\nexport const ', start + response.length);
        if (start < 0) throw new Error(`${source}: missing ${operation} response validator`);
        const end = next < 0 ? generated.length : next;
        const fields = '"fields": zod.record(zod.string(), zod.string())';
        const uploadResponse = generated.slice(start, end);
        if (!uploadResponse.includes(fields)) throw new Error(`${source}: missing upload fields`);
        const minFields = attachmentSchemas.AttachmentUpload.properties.fields.minProperties;
        generated =
          generated.slice(0, start) +
          uploadResponse.replace(
            fields,
            `${fields}.refine((value) => Object.keys(value).length >= ${minFields}, { message: 'At least ${minFields} signed form field' })`,
          ) +
          generated.slice(end);
      }

      if (declarations.length > 0) {
        const maxName = attachmentSchemas.AttachmentFileName.maxLength;
        const names = [...generated.matchAll(/\.max\(([A-Za-z][A-Za-z0-9]*FileNameMax)\)/g)];
        if (names.length === 0) throw new Error(`${source}: missing file name validators`);
        for (const [, limit] of names) {
          generated = generated.replaceAll(
            `.max(${limit})`,
            `.refine((value) => Array.from(value).length <= ${limit}, { message: 'At most ${maxName} Unicode code points' })`,
          );
        }
      }

      for (const operation of closedIntakeResponses[spec] ?? []) {
        const response = `export const ${operation}Response = zod.object({`;
        if (!generated.includes(response))
          throw new Error(`${source}: missing ${operation} response validator`);
        generated = generated.replace(response, response.replace('zod.object', 'zod.strictObject'));
      }
    }
    if (
      root.name === 'contracts' &&
      ['public/profile-media', 'internal/storage-service'].includes(spec)
    ) {
      const transfers =
        spec === 'public/profile-media'
          ? ['StartAvatarUploadResponse', 'StartOrganizationLogoUploadResponse']
          : ['SignProfileMediaTransferInternalResponse'];
      const limit = mediaSchemas.ProfileMediaUpload.properties.fields.minProperties;

      for (const transfer of transfers) {
        const declaration = `export const ${transfer} = `;
        const start = generated.indexOf(declaration);
        const next = generated.indexOf('\nexport const ', start + declaration.length);
        const end = next < 0 ? generated.length : next;
        const response = generated.slice(start, end);
        const fields = '"fields": zod.record(zod.string(), zod.string())';
        if (start < 0 || !response.includes(fields))
          throw new Error(`${source}: missing signed multipart fields for ${transfer}`);
        generated =
          generated.slice(0, start) +
          response.replace(
            fields,
            `${fields}.refine((value) => Object.keys(value).length >= ${limit}, { message: 'At least ${limit} signed form field' })`,
          ) +
          generated.slice(end);
      }
    }
    if (
      root.name === 'contracts' &&
      [
        'public/attachments',
        'public/intake',
        'internal/storage-service',
        'public/inbox',
        'public/reminders',
        'internal/notification-service',
        'public/profile-media',
        'public/realtime',
      ].includes(spec)
    ) {
      // Keep a single final newline in the generated capability type files.
      const types = `${root.contracts}/types/${spec}.ts`;
      writeFileSync(types, `${readFileSync(types, 'utf8').replace(/\n+$/, '')}\n`);
    }
    writeFileSync(target, generated);
  }
}

const HTTP_METHODS = ['get', 'put', 'post', 'patch', 'delete'];
const ERROR_STATUSES = new Set(['400', '401', '403', '404', '409', '412', '422', '429', '503']);
const ACTORS = ['user', 'automation', 'git', 'system'];

// Document each node reached through a `$ref` to another file was read from. A `$ref` written inside
// a shared component (components/) points into that file, not into the spec being linted, so it is
// resolved from there.
const origins = new WeakMap();

function remember(node, source) {
  if (!node || typeof node !== 'object' || origins.has(node)) return;
  origins.set(node, source);
  for (const child of Object.values(node)) remember(child, source);
}

function resolve(node, context) {
  if (!node || typeof node !== 'object' || !('$ref' in node)) return node;
  const resolved = context.resolve(node, origins.get(node));
  if (resolved?.node === undefined || resolved.node === null) return node;
  const source = resolved.location?.source?.absoluteRef;
  if (source !== undefined && source !== context.location.source.absoluteRef) {
    remember(resolved.node, source);
  }
  return resolved.node;
}

function hasRequired(schema, names) {
  if (!schema || typeof schema.properties !== 'object' || schema.properties === null) return false;
  if (!Array.isArray(schema.required)) return false;
  return names.every(
    (name) => schema.required.includes(name) && Object.hasOwn(schema.properties, name),
  );
}

function operations(root, context) {
  return Object.entries(root.paths ?? {}).flatMap(([path, item]) => {
    const pathItem = context ? resolve(item, context) : item;
    return HTTP_METHODS.flatMap((method) =>
      pathItem?.[method] ? [{ path, method, operation: pathItem[method] }] : [],
    );
  });
}

function parameters(root, context) {
  const collected = [];
  const seen = new WeakSet();
  function visit(value) {
    const node = resolve(value, context);
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node.parameters)) {
      collected.push(...node.parameters.map((parameter) => resolve(parameter, context)));
    }
    for (const child of Object.values(node)) visit(child);
  }
  visit(root.paths);
  return collected;
}

function responseEntries(root, context) {
  return operations(root, context).flatMap(({ path, method, operation }) =>
    Object.entries(operation.responses ?? {}).map(([status, response]) => ({
      path,
      method,
      status,
      response: resolve(response, context),
    })),
  );
}

function asyncMessages(root, context) {
  const channelMessages = Object.entries(root.channels ?? {}).flatMap(([channelName, channel]) =>
    Object.entries(resolve(channel, context)?.messages ?? {}).map(([messageName, message]) => ({
      node: resolve(message, context),
      path: ['channels', channelName, 'messages', messageName],
    })),
  );
  const components = Object.entries(root.components?.messages ?? {}).map(([name, message]) => ({
    node: resolve(message, context),
    path: ['components', 'messages', name],
  }));
  return [...channelMessages, ...components];
}

function hasDynamicRef(value, context, seen = new WeakSet()) {
  const node = resolve(value, context);
  if (!node || typeof node !== 'object' || seen.has(node)) return false;
  seen.add(node);
  return (
    Object.hasOwn(node, '$dynamicRef') ||
    Object.values(node).some((child) => hasDynamicRef(child, context, seen))
  );
}

function check(rule) {
  return () => ({
    Root: {
      enter(root, context) {
        for (const finding of rule(root, context)) {
          if (typeof finding === 'string') {
            context.report({ message: finding });
          } else {
            const location = context.location.child(finding.path);
            context.report({
              message: finding.message,
              location: finding.key ? location.key() : location,
            });
          }
        }
      },
    },
  });
}

function invalid(condition, message) {
  return condition ? [message] : [];
}

const openapi = {
  'openapi-version': (root) =>
    invalid(!/^3\.1\.\d+$/.test(root.openapi ?? ''), 'OpenAPI must use version 3.1.x.'),
  'openapi-no-dynamic-ref': (root, context) =>
    invalid(hasDynamicRef(root, context), '$dynamicRef is not allowed.'),
  'openapi-no-path-items-component': (root) =>
    invalid(
      Object.hasOwn(root.components ?? {}, 'pathItems'),
      'components.pathItems is not allowed.',
    ),
  'path-kebab-case': (root) =>
    Object.keys(root.paths ?? {})
      .filter((path) => !/^(\/([a-z][a-z0-9]*(-[a-z0-9]+)*|\{[a-z][A-Za-z0-9]*\}))+$/.test(path))
      .map((path) => ({ message: `Invalid path: ${path}`, path: ['paths', path], key: true })),
  'path-plural-collection': (root) =>
    Object.keys(root.paths ?? {})
      .filter((path) => /[^s/]\/\{/.test(path))
      .map((path) => ({
        message: `Collection should be plural: ${path}`,
        path: ['paths', path],
        key: true,
      })),
  'path-no-organization': (root) =>
    Object.keys(root.paths ?? {})
      .filter((path) => /\/\{(org|organi[sz]ation)(Id)?\}/.test(path))
      .map((path) => ({
        message: `Organization must not be in the path: ${path}`,
        path: ['paths', path],
        key: true,
      })),
  'path-prefix-public': (root, context) => {
    const file = String(context.location.source.absoluteRef).replaceAll('\\', '/');
    return file.includes('/openapi/public/')
      ? Object.keys(root.paths ?? {})
          .filter((path) => !path.startsWith('/v1/'))
          .map((path) => ({
            message: `Invalid public path: ${path}`,
            path: ['paths', path],
            key: true,
          }))
      : [];
  },
  'path-prefix-internal': (root, context) => {
    const file = String(context.location.source.absoluteRef).replaceAll('\\', '/');
    return file.includes('/openapi/internal/')
      ? Object.keys(root.paths ?? {})
          .filter((path) => !path.startsWith('/internal/v1/'))
          .map((path) => ({
            message: `Invalid internal path: ${path}`,
            path: ['paths', path],
            key: true,
          }))
      : [];
  },
  'error-status': (root) =>
    operations(root).flatMap(({ path, method, operation }) =>
      Object.keys(operation.responses ?? {})
        .filter((status) => /^[45]/.test(status) && !ERROR_STATUSES.has(status))
        .map((status) => ({
          message: `Unsupported error status: ${status}`,
          path: ['paths', path, method, 'responses', status],
          key: true,
        })),
    ),
  'error-problem-json': (root, context) =>
    responseEntries(root, context)
      .filter(
        ({ status, response }) =>
          /^[45]/.test(status) &&
          (Object.keys(response?.content ?? {}).length !== 1 ||
            !response.content?.['application/problem+json']),
      )
      .map(({ path, method, status }) => ({
        message: `Error ${status} must use application/problem+json.`,
        path: ['paths', path, method, 'responses', status],
      })),
  'problem-schema': (root, context) =>
    responseEntries(root, context)
      .filter(({ status, response }) => {
        const schema = resolve(response?.content?.['application/problem+json']?.schema, context);
        return (
          /^[45]/.test(status) &&
          schema &&
          (!schema.properties ||
            typeof schema.properties !== 'object' ||
            !['type', 'title', 'status', 'detail', 'instance', 'code', 'details'].every((key) =>
              Object.hasOwn(schema.properties, key),
            ) ||
            !Array.isArray(schema.required) ||
            !['type', 'title', 'status', 'code'].every((key) => schema.required.includes(key)))
        );
      })
      .map(({ path, method, status }) => ({
        message: 'Invalid problem schema.',
        path: ['paths', path, method, 'responses', status],
      })),
  'pagination-no-offset': (root, context) =>
    parameters(root, context)
      .filter(
        (parameter) =>
          parameter?.in === 'query' &&
          /^(page|pageNumber|pageSize|perPage|per_page|offset|skip)$/.test(parameter.name),
      )
      .map((parameter) => `Unsupported pagination parameter: ${parameter.name}`),
  'pagination-limit': (root, context) =>
    parameters(root, context)
      .filter((parameter) => {
        if (parameter?.in !== 'query' || parameter.name !== 'limit' || !parameter.schema)
          return false;
        const schema = resolve(parameter.schema, context);
        return (
          schema.type !== 'integer' ||
          schema.minimum !== 1 ||
          !Number.isInteger(schema.maximum) ||
          schema.maximum < 1 ||
          schema.maximum > 100 ||
          schema.default !== 50
        );
      })
      .map(() => 'Invalid pagination limit.'),
  'pagination-cursor': (root, context) =>
    operations(root, context)
      .filter(({ method, operation }) => {
        if (method !== 'get') return false;
        const params = (operation.parameters ?? []).map((parameter) => resolve(parameter, context));
        const names = params
          .filter((parameter) => parameter?.in === 'query')
          .map((parameter) => parameter.name);
        if (!names.includes('cursor') && !names.includes('limit')) return false;
        const response = resolve(operation.responses?.['200'], context);
        const schema = resolve(response?.content?.['application/json']?.schema, context);
        const types = resolve(schema?.properties?.nextCursor, context)?.type;
        return (
          !names.includes('cursor') ||
          !names.includes('limit') ||
          !schema?.required?.includes('nextCursor') ||
          !Array.isArray(types) ||
          types.length !== 2 ||
          !types.includes('string') ||
          !types.includes('null')
        );
      })
      .map(() => 'Invalid cursor pagination.'),
};

const asyncapi = {
  'asyncapi-version': (root) =>
    invalid(root.asyncapi !== '3.0.0', 'AsyncAPI must use version 3.0.0.'),
  'event-channel-address': (root, context) =>
    Object.entries(root.channels ?? {})
      .map(([name, channel]) => ({ name, node: resolve(channel, context) }))
      .filter(
        ({ node }) =>
          !/^evt\.[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+\.v[1-9][0-9]*$/.test(node?.address ?? ''),
      )
      .map(({ name }) => ({ message: 'Invalid event channel address.', path: ['channels', name] })),
  'event-name': (root, context) =>
    asyncMessages(root, context)
      .filter(
        ({ node }) => !/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+\.v[1-9][0-9]*$/.test(node?.name ?? ''),
      )
      .map(({ path }) => ({ message: 'Invalid event name.', path })),
  'event-payload': (root, context) =>
    asyncMessages(root, context)
      .filter(({ node }) => {
        if (!node?.payload) return false;
        const payload = resolve(node.payload, context);
        const actor = resolve(payload?.properties?.actor, context);
        const actorType = resolve(actor?.properties?.type, context);
        return (
          !hasRequired(payload, ['id', 'occurredAt', 'organizationId', 'actor', 'version']) ||
          resolve(payload?.properties?.version, context)?.type !== 'integer' ||
          !hasRequired(actor, ['type', 'id']) ||
          !Array.isArray(actorType?.enum) ||
          actorType.enum.length !== 4 ||
          !ACTORS.every((type) => actorType.enum.includes(type))
        );
      })
      .map(({ path }) => ({ message: 'Invalid event payload.', path })),
};

function rulesFor(definitions) {
  return Object.fromEntries(Object.entries(definitions).map(([name, rule]) => [name, check(rule)]));
}

export default function contractsPlugin() {
  return { id: 'cadenway', rules: { oas3: rulesFor(openapi), async3: rulesFor(asyncapi) } };
}

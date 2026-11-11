/**
 * Entry point of `@waypoint/contracts`: the shared enumerations authored in `./enums/`.
 *
 * It exports nothing yet, because no shared enumeration has been authored. The generated modules
 * are not re-exported here: each one is imported through its own subpath, so two specs may use the
 * same schema name.
 *
 * - `@waypoint/contracts/types/<spec>`: TypeScript types of an OpenAPI document;
 * - `@waypoint/contracts/validators/<spec>`: zod validators of its operations;
 * - `@waypoint/contracts/events/<spec>`: event names and payload types of an AsyncAPI document.
 *
 * `<spec>` is the path of the document below `openapi/` or `asyncapi/`, without extension.
 */
export {};

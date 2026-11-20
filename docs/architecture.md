# Architecture and ownership

[Documentation index](README.md) · [Repository instructions](../AGENTS.md)

## Status

The tooling described here exists and runs: lint, generation, breaking-change check, build and CI. The contracts are those of identity-service (sign-up, sign-in, sessions, the current user and its profile, personal API tokens, and their events), of organization-service (organizations, members, invitations and their events) and of task-service (spaces, lists and sprints, tasks, subtasks, checklists, activity logs, task queries, "Mes tâches" and "Accueil", sharing and access requests, archives, the trash and deletions, and their events); the two packages publish them with the shared enumerations. Each section says what is checked by a fixture and what is still a target.

## Purpose and target structure

cadenway-api-contracts is the common language of Cadenway: what the API gateway exposes, what each service exposes internally, and what the services say to each other. It publishes `@cadenway/contracts` and `@cadenway/api-client`, generated from the specs.

```text
openapi/public/      ← one file per domain (tasks.yaml, billing.yaml…)
openapi/internal/    ← one file per service (task-service.yaml…)
asyncapi/            ← one file per emitting service
components/          ← what the specs share by `$ref` (problem, pagination, actor)
packages/contracts/  → @cadenway/contracts
packages/api-client/ → @cadenway/api-client (generated)
```

Implementation order after a release: producing service, then gateways and listening services, then the webapp. Each step only adds, so each repository ships alone.

## Architectural ownership

The [Angular architecture checker](https://github.com/Cadenway/cadenway-tooling/tree/main/packages/angular-testing) uses its library profile to check the hand-written Angular client entry points. Generated sources are excluded. Run `pnpm test:architecture` to run it on its own. Both `pnpm quality` and the CI quality gate run it.

- `openapi/` and `asyncapi/`: authored specs.
- `components/`: authored components the specs share by `$ref`; no route and no event.
- `packages/contracts/src/enums/`: authored shared enumerations.
- `packages/*/src/generated/` and `tests/codegen/generated/`: generated, never edited.
- `scripts/`: the generation, spec shipping and breaking-change scripts behind the pnpm commands.

## Boundaries

- No implementation: no business logic, no server code.
- Generated folders are never edited by hand.
- Shared enumerations (statuses, categories, priorities, cancel reasons, recurrences) live here once; no other repository redefines them.

## What a spec becomes

`pnpm generate` empties the generated trees, then writes them again from the specs. The folders are listed once, in `scripts/lib/roots.mjs`.

| Source                      | Written by                           | Result                                                                                                      | Imported as                                    |
| --------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `openapi/**`                | orval, schemas only                  | one TypeScript type per schema and per parameter set                                                        | `@cadenway/contracts/types/<spec>`             |
| `openapi/**`                | orval, zod + validator postprocessor | one validator per operation part (path, query, headers, body, success response)                             | `@cadenway/contracts/validators/<spec>`        |
| `openapi/public/**`         | orval, Angular                       | `HttpClient` services and their models                                                                      | `@cadenway/api-client`                         |
| `asyncapi/**`               | `scripts/generate-events.mjs`        | event names, payload types, zod validators, the three by event name, and the names of the restricted events | `@cadenway/contracts/events/<spec>`            |
| `openapi/**`, `asyncapi/**` | `scripts/bundle-specs.mjs`, at build | each spec as one self-contained YAML file                                                                   | `@cadenway/contracts/specs/<kind>/<spec>.yaml` |

Decisions and their reasons:

- **OpenAPI validators receive a postprocessing step.** `scripts/postprocess-validators.mjs`
  inspects dereferenced query parameters to parse `true` and `false`, applies strict empty-body
  validation only to marked new operations, and preserves published empty validators. It also
  corrects Unicode code-point lengths, milestone response constants and bulk action constraints
  that Orval cannot express directly. Re-run `pnpm generate`; never edit generated output by hand.

- **`types/` has its own producer and is not derived from the validators.** orval writes the validators per operation, with every schema inlined, and writes nothing for error responses: the named schemas (`Task`, `Problem`) exist only in `types/`. A consumer that needs a shape imports a type that costs nothing at run time.
- **Events are generated by a script of this repository.** It reads each document through `redocly bundle --dereferenced`, then writes the type and the validator of a payload from one walk of its schema, so the two cannot disagree; the validator is also checked against the type by the compiler. It refuses a keyword it cannot turn into a validator, naming the place, and reads AsyncAPI 3.0.0 only. Modelina, tried on the event fixture, named the payload `AnonymousSchema_3`, renamed its `type` member `reservedType`, wrote no validator and failed on a `$ref` to another file.
- **An event validator drops members it does not know** unless its schema controls
  `additionalProperties`, so an older consumer still reads an event that gained an optional member.
  Published OpenAPI empty-body validators retain their existing stripping behavior even when their
  schema is closed; marked new empty bodies are strict.
- **The shipped specs are bundled.** A service that generates its own client for another service reads one file, with the default options of its generator. No Node client is generated here: the service kit depends on this package, so a client that used the kit would close a cycle.
- **The fixture is generated too.** `tests/codegen/generated/` is the code of the documents of `tests/redocly/valid/`, committed and compiled with the options of each package. A generator change, or an upgrade of orval, that alters the code shows in a diff and in CI, and the fixture stays out of `openapi/` and `asyncapi/`, whose specs are published and compared with `main`.

## Shared components

What every spec uses with the same shape lives in `components/`, outside `openapi/` and `asyncapi/`, and is referenced by a relative `$ref`:

| File                           | Holds                                                                                                                                                                                                                                                                        | Referenced as                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `components/http.yaml`         | `Problem` (schema and response), `Cursor` and `Limit` (parameters), `NextCursor` (schema)                                                                                                                                                                                    | `../../components/http.yaml#/components/...`                                           |
| `components/events.yaml`       | `Actor` (schema)                                                                                                                                                                                                                                                             | `../components/events.yaml#/components/schemas/Actor`                                  |
| `components/organization.yaml` | `Role` (schema)                                                                                                                                                                                                                                                              | `../../components/organization.yaml#/components/schemas/Role`                          |
| `components/task.yaml`         | `StatusKey`, `StatusCategory`, `PriorityKey`, `CancelReason` (the shared enumerations), the spaces, lists, tasks, activity entries, grants, access requests, archives and trash entries of the public and internal task routes, and the query parameters of the task queries | `../../components/task.yaml#/components/schemas/...` and `#/components/parameters/...` |

Why a folder of its own and not a copy in each spec:

- every YAML file under `openapi/` is taken for a spec by the generation, by `pnpm lint:specs` and by oasdiff, so a shared file cannot live there;
- a copy per spec is checked by the lint rules only in part (the members of the problem, the four actor types), and nothing would keep a copied enumeration equal across documents.

What the choice costs, each point handled in this repository:

- orval refuses a `$ref` to another file unless it is listed: `orval.config.ts` lists the files of `components/` for each spec;
- oasdiff does the same in CI: the `breaking` job and `pnpm breaking` pass `allow-external-refs`. A change in `components/` is compared through every spec that references it;
- the Redocly rules follow a `$ref` written inside a shared component from the file that holds it (`rules/contracts-redocly.mjs`);
- an event payload still declares `properties` and `required` itself: a member may be a `$ref`, the envelope is never composed with `allOf`;
- the shipped specs are bundled, so a consumer never sees the reference;
- orval generates every schema of a referenced component file in each document that references it, so the documents of spaces, lists and tasks each carry the whole of `components/task.yaml`, and `packages/api-client/src/public-api.ts` exports each of its declarations once;
- orval drops the keywords written beside a `$ref` inside a component file, a `default` included: a member of `components/task.yaml` with a default declares its values itself, and `tests/contracts/task.spec.ts` compares them with the shared schema they copy (`StatusKey`, `PriorityKey`, `LookColor`, `LookIcon`, `Visibility`), the first two also with `packages/contracts/src/enums/`.

These component files are valid documents and are linted like the specs. When a spec needs one of
the shared enumerations from TypeScript, its schema joins `components/` with a test that compares
its values with `packages/contracts/src/enums/`.

## Cross-repository changes

Each checkout owns its implementation and release. Use published `@cadenway/*` packages instead of sibling source imports or local dependency links. For contract changes, make the contract and generated package available first, then update the producing service, gateways and listeners, and finally the webapp. Each step should remain deployable independently.

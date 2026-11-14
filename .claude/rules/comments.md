---
paths:
  - 'packages/**/*.ts'
  - 'tests/**/*.ts'
  - 'openapi/**/*.yaml'
  - 'openapi/**/*.yml'
  - 'asyncapi/**/*.yaml'
  - 'asyncapi/**/*.yml'
---

# Comments and docblocks

- Write comments in English and explain purpose, contracts, constraints and trade-offs. Do not
  paraphrase identifiers or leave commented-out code. A TODO must include a task ID.
- Document authored top-level declarations and class, interface, named object type and enum members,
  including private members, with a JSDoc before the declaration or first decorator. Explicit
  re-exports do not need duplicate documentation; local variables and anonymous object members do
  not need declaration docblocks. Keep descriptions useful and synchronized with behavior.
- Use a title matching the declaration (`Class Name`, `Component Name`, `Service Name`,
  `Property name`, `Method name`, `Function name`, `Interface Name`, `Type Name`,
  `Constant NAME` or `Constructor`), then a standalone `@description` and contract prose.
  Use `@type {Type}` for declared types, `@readonly` only on readonly members, `@constructor`
  for constructors, `@param {Type} name - Description` for named parameters, and
  `@returns {Type} Description` for non-void returns. Keep tags accurate and use TypeScript access
  modifiers rather than `@access`.
- Group adjacent members in `// #region Properties`, `// #region Constructor` or
  `// #region Methods`, closed with `// #endregion`; getters and setters are properties. Put the
  first docblock directly after the opener and the closer directly after the last member, with one
  blank line between documented members.
- Do not add inline ESLint suppressions or comments inside decorator metadata. Resolve the underlying
  issue and document necessary rationale at the declaration. Follow the repository's TypeScript,
  lint and formatting configuration; review semantic accuracy as well as formatting.

## Contracts and generated code

Use OpenAPI and AsyncAPI descriptions, examples and delivery notes to document behavior where the
contract owns it. Do not manually edit generated clients, schemas or other generated output. Apply
the TypeScript convention only to authored code; run the repository's spec and format checks.

## Detailed examples and review

Comments are part of the maintained contract. Write them in English and update them with the code.
Describe what callers can rely on, units, permitted values, defaults, side effects and failure
conditions when relevant. State why an implementation must behave a certain way; do not narrate
obvious operations, repeat a type that already appears in the required tag as prose, or promise
behavior that the implementation or contract does not provide.

### Placement and scope

- Put the JSDoc immediately before the declaration or its first decorator. Document authored
  declarations and members, including private ones; explicit re-exports and local variables do not
  need their own blocks. Document meaningful exported type and interface members individually.
- Put the explanation of a class, component, directive or service above its decorator, not inside
  decorator metadata. Avoid comments in templates; document the behavior at its declaration.
- Keep a single docblock per declaration. Do not leave a second block of stale or duplicated prose
  above it. Keep region markers inside the class, interface or named object type that owns them.
- For tests, document reusable helpers and fixture declarations; make test names describe observable
  behavior. Do not insert comments merely to narrate setup, assertions or framework calls.

### Required tags

- Begin with the declaration kind and exact name, then a standalone `@description` and meaningful
  prose. Use `@type {Type}` for typed properties, constants and type aliases; preserve generics,
  unions, nullability and units where applicable.
- Use `@readonly` only when the member is actually readonly and `@constructor` for constructors.
  Document each named parameter with `@param {Type} name - Description` in declaration order.
  Use `@returns {Type} Description` for non-void results and document a returned Promise as such.
  Describe thrown errors with `@throws` when that is part of the caller's contract.
- Use explicit TypeScript access modifiers where the repository's configuration permits them;
  do not add `@access` tags or change visibility just to satisfy documentation. Keep examples and
  tags consistent with the actual signature. Resolve lint errors instead of inserting ESLint
  suppression comments.

### Example: class, properties, constructor and method

```ts
/**
 * Class RetryPolicy
 *
 * @description
 * Calculates the delay between delivery attempts without scheduling them.
 */
export class RetryPolicy {
  // #region Properties
  /**
   * Property maximumAttempts
   *
   * @description
   * Maximum number of delivery attempts allowed by this policy.
   *
   * @type {number}
   * @readonly
   */
  public readonly maximumAttempts: number;
  // #endregion

  // #region Constructor
  /**
   * Constructor
   *
   * @description
   * Stores the configured attempt limit.
   *
   * @param {number} maximumAttempts - Maximum number of delivery attempts.
   * @constructor
   */
  public constructor(maximumAttempts: number) {
    this.maximumAttempts = maximumAttempts;
  }
  // #endregion

  // #region Methods
  /**
   * Method delayFor
   *
   * @description
   * Returns the delay before an attempt, in milliseconds.
   *
   * @param {number} attempt - One-based attempt number.
   * @returns {number} Delay in milliseconds.
   */
  public delayFor(attempt: number): number {
    return attempt * 1000;
  }
  // #endregion
}
```

### Example: interface and type

```ts
/**
 * Interface RetryOptions
 *
 * @description
 * Configuration used to limit delivery attempts.
 */
export interface RetryOptions {
  // #region Properties
  /**
   * Property maximumAttempts
   *
   * @description
   * Maximum number of attempts before delivery is stopped.
   *
   * @type {number}
   * @readonly
   */
  readonly maximumAttempts: number;
  // #endregion
}

/**
 * Type DeliveryState
 *
 * @description
 * Possible outcomes of a delivery attempt.
 *
 * @type {'pending' | 'sent'}
 */
export type DeliveryState = 'pending' | 'sent';
```

### Review and verification

Before finishing, check title and tag names against the actual declaration, review whether every
description adds information, verify that no comment exposes secret values or personal data, and
check that examples still compile or remain syntactically valid for the relevant language. Run the
repository's existing scoped formatter and lint checks. A documentation-only rule does not itself
install an ESLint rule or prove semantic correctness; do not report enforcement that is not present.

### OpenAPI and AsyncAPI

Use schema, operation, channel and field descriptions for consumer-visible behavior: scopes, status
and error codes, event version, ownership, delivery semantics and nullability as applicable. Add
examples that match the actual schema; distinguish documented guarantees from assumptions. Edit
source specifications and authored TypeScript only, never generated clients or generated validators.
Run the existing spec validation and compatibility checks when their inputs change.

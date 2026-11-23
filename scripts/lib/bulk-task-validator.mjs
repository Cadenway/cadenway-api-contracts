import ts from 'typescript';

const distinctTaskKeys =
  ".refine((value) => new Set(value.selection.map((entry) => entry.taskKey)).size === value.selection.length, { path: ['selection'], message: 'Task keys must be distinct' })";

/**
 * Close the generated bulk-action objects and enforce uniqueness by key across row versions.
 */
export function strengthenBulkTaskValidator(declaration, validatorName, source) {
  const ast = ts.createSourceFile(
    source,
    declaration,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const statement = ast.statements[0];
  const binding =
    statement && ts.isVariableStatement(statement)
      ? statement.declarationList.declarations[0]
      : undefined;
  const initializer = binding?.initializer;
  let object = initializer;
  if (
    initializer &&
    ts.isCallExpression(initializer) &&
    ts.isPropertyAccessExpression(initializer.expression) &&
    initializer.expression.name.text === 'describe'
  ) {
    object = initializer.expression.expression;
  }
  if (
    binding?.name.getText(ast) !== validatorName ||
    !object ||
    !ts.isCallExpression(object) ||
    object.expression.getText(ast) !== 'zod.object'
  ) {
    throw new Error(`${source}: missing bulk request object for ${validatorName}`);
  }

  return (
    declaration.slice(0, object.end).replaceAll('zod.object({', 'zod.strictObject({') +
    distinctTaskKeys +
    declaration.slice(object.end)
  );
}

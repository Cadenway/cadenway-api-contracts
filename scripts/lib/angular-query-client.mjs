import ts from 'typescript';

/** Set text decoding for generated QUERY operations whose responses are text. */
export function rewriteAngularQueryCalls(text, file, textOperations = new Set()) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const edits = [];

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'query' &&
      node.expression.expression.getText(source) === 'this.http'
    ) {
      let method = node.parent;
      while (method && !ts.isMethodDeclaration(method)) method = method.parent;
      const textResponse = method && textOperations.has(method.name.getText(source));
      if (!textResponse) return;
      const options = node.arguments[2];
      if (
        node.arguments.length !== 3 ||
        !ts.isObjectLiteralExpression(options) ||
        options.properties.some((property) => property.name?.getText(source) === 'responseType')
      ) {
        throw new Error(`${file}: unsupported generated text HttpClient.query call`);
      }
      const responseType = "responseType: 'text',";
      if (node.typeArguments?.length !== 1 || node.typeArguments[0].getText(source) !== 'TData') {
        throw new Error(`${file}: unsupported text QUERY result type`);
      }
      edits.push({
        start: node.typeArguments.pos - 1,
        end: node.typeArguments.end + 1,
        value: '',
      });
      let branch = node.parent;
      while (branch && branch !== method && !ts.isIfStatement(branch)) branch = branch.parent;
      const condition = branch && ts.isIfStatement(branch) ? branch.expression.getText(source) : '';
      const resultType = condition.includes("'events'")
        ? 'HttpEvent<TData>'
        : condition.includes("'response'")
          ? 'AngularHttpResponse<TData>'
          : 'TData';
      edits.push({ start: node.end, end: node.end, value: ` as Observable<${resultType}>` });
      const closingLine = text.lastIndexOf('\n', options.end - 1) + 1;
      const indent = text.slice(closingLine, options.end - 1);
      const separator =
        options.properties.length > 0 && !options.properties.hasTrailingComma ? ',' : '';
      if (closingLine > options.getStart(source) && /^\s*$/.test(indent)) {
        if (separator) {
          const lastProperty = options.properties[options.properties.length - 1];
          edits.push({ start: lastProperty.end, end: lastProperty.end, value: separator });
        }
        edits.push({
          start: closingLine,
          end: closingLine,
          value: `${indent}  ${responseType}\n`,
        });
      } else {
        edits.push({
          start: options.end - 1,
          end: options.end - 1,
          value: `${separator} ${responseType} `,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return edits
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, edit) => result.slice(0, edit.start) + edit.value + result.slice(edit.end),
      text,
    );
}

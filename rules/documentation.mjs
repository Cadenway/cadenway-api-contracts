/**
 * Checks the structural portion of the declaration documentation convention. A human still
 * needs to review whether the description and tags accurately describe the implementation.
 */
const uiDocumentation = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Require structured documentation on authored declarations' },
    schema: [],
    messages: {
      structure:
        'Use a declaration title and a standalone @description followed by contract prose.',
      constructor: 'Mark the constructor with @constructor.',
      type: 'Document the declared type with an @type tag.',
      readonly: 'Mark this readonly member with @readonly.',
      unexpectedReadonly: 'Use @readonly only on a readonly member.',
      access: 'Express access with a TypeScript modifier, not an @access tag.',
    },
  },
  create(context) {
    const source = context.sourceCode;
    const isStory = context.filename.endsWith('.stories.ts');

    function inspect(node, story = false) {
      const target =
        node.decorators?.[0] ??
        (node.parent?.type === 'ExportNamedDeclaration' ? node.parent : node);
      const comments = source.getCommentsBefore(target);
      const comment = comments.at(-1);
      if (!comment || comment.type !== 'Block' || !comment.value.startsWith('*')) return;
      if (story) return;

      const text = comment.value;
      const title = /^\*\s*\r?\n\s*\*\s+([^\r\n]+)\r?\n/u.exec(text)?.[1]?.trim();
      const name = node.id?.name ?? node.key?.name ?? node.key?.value;
      const variable = node.type === 'VariableDeclaration' ? node.declarations[0] : undefined;
      let expected;
      switch (node.type) {
        case 'ClassDeclaration':
          expected = ['Class', 'Component', 'Directive', 'Service'].map(
            (kind) => `${kind} ${name}`,
          );
          break;
        case 'TSInterfaceDeclaration':
          expected = [`Interface ${name}`];
          break;
        case 'TSTypeAliasDeclaration':
          expected = [`Type ${name}`];
          break;
        case 'TSEnumDeclaration':
          expected = [`Enum ${name}`];
          break;
        case 'FunctionDeclaration':
          expected = [`Function ${name}`];
          break;
        case 'VariableDeclaration':
          if (variable?.id.type === 'Identifier') {
            const kind =
              variable.init?.type === 'ArrowFunctionExpression' ? 'Function' : 'Constant';
            expected = [`${kind} ${variable.id.name}`];
          }
          break;
        case 'MethodDefinition':
        case 'TSAbstractMethodDefinition':
          expected =
            node.kind === 'constructor'
              ? ['Constructor']
              : [`${node.kind === 'get' || node.kind === 'set' ? 'Property' : 'Method'} ${name}`];
          break;
        case 'TSMethodSignature':
          expected = [`Method ${name}`];
          break;
        case 'TSEnumMember':
          expected = [`Property ${name}`, `Case ${name}`];
          break;
        default:
          expected = [`Property ${name}`];
      }
      const hasTitle = title !== undefined && (expected === undefined || expected.includes(title));
      const hasDescription = /\r?\n\s*\*\s+@description\s*\r?\n\s*\*\s+[^\s*@][^\r\n]*/u.test(text);
      if (!hasTitle || !hasDescription) {
        context.report({ node, messageId: 'structure' });
        return;
      }

      const tags = text.split(/\r?\n/u).map((line) => line.replace(/^\s*\*\s?/u, '').trim());
      if (tags.some((line) => /^@access(?:\s|$)/u.test(line))) {
        context.report({ node, messageId: 'access' });
      }
      const isTypedMember =
        node.type === 'PropertyDefinition' ||
        node.type === 'TSAbstractPropertyDefinition' ||
        node.type === 'TSPropertySignature';
      const isTypedConstant =
        node.type === 'VariableDeclaration' &&
        variable?.id.type === 'Identifier' &&
        variable.id.typeAnnotation &&
        variable.init?.type !== 'ArrowFunctionExpression';
      if (
        (isTypedMember && node.typeAnnotation) ||
        isTypedConstant ||
        node.type === 'TSTypeAliasDeclaration'
      ) {
        if (!tags.some((line) => /^@type\s+\{.+\}$/u.test(line))) {
          context.report({ node, messageId: 'type' });
        }
      }
      if (isTypedMember && node.readonly && !tags.includes('@readonly')) {
        context.report({ node, messageId: 'readonly' });
      }
      if (isTypedMember && !node.readonly && tags.includes('@readonly')) {
        context.report({ node, messageId: 'unexpectedReadonly' });
      }

      const callable =
        node.type === 'FunctionDeclaration' || node.type === 'TSMethodSignature'
          ? node
          : node.type === 'MethodDefinition' || node.type === 'TSAbstractMethodDefinition'
            ? node.value
            : variable?.init?.type === 'ArrowFunctionExpression'
              ? variable.init
              : null;
      if (!callable) return;

      if (node.kind === 'constructor' && !tags.includes('@constructor')) {
        context.report({ node, messageId: 'constructor' });
      }
    }

    function inspectVariable(node) {
      if (node.parent.type !== 'Program' && node.parent.type !== 'ExportNamedDeclaration') return;
      inspect(node, isStory && node.parent.type === 'ExportNamedDeclaration');
    }

    function inspectMember(node) {
      const container = node.parent;
      if (container.type === 'ClassBody' && container.parent.type !== 'ClassDeclaration') return;
      if (container.type === 'TSTypeLiteral' && container.parent.type !== 'TSTypeAliasDeclaration')
        return;
      inspect(node);
    }

    return {
      ClassDeclaration: inspect,
      TSInterfaceDeclaration: inspect,
      TSTypeAliasDeclaration: inspect,
      TSEnumDeclaration: inspect,
      TSEnumMember: inspect,
      FunctionDeclaration: inspect,
      VariableDeclaration: inspectVariable,
      PropertyDefinition: inspectMember,
      MethodDefinition: inspectMember,
      TSAbstractPropertyDefinition: inspectMember,
      TSAbstractMethodDefinition: inspectMember,
      TSPropertySignature: inspectMember,
      TSMethodSignature: inspectMember,
    };
  },
};

export default uiDocumentation;

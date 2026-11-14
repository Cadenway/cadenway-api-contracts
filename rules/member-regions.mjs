/** Enforces the member-group markers required by the UI documentation convention. */
const uiMemberRegions = {
  meta: {
    type: 'layout',
    docs: { description: 'Require documented UI members to use the prescribed regions' },
    schema: [],
    messages: {
      open: 'Place this member group in a {{region}} region with no blank line before its first docblock.',
      close: 'Close this member group with // #endregion on the next line.',
      separation: 'Separate documented members with exactly one blank line.',
      marker:
        'Use only the prescribed member region markers inside a class, interface or named object type.',
      unbalanced: 'Balance each region opener with an exact // #endregion marker.',
    },
  },
  create(context) {
    const source = context.sourceCode;

    function category(member) {
      if (member.type === 'MethodDefinition' && member.kind === 'constructor') return 'Constructor';
      if (
        member.type === 'MethodDefinition' ||
        member.type === 'TSAbstractMethodDefinition' ||
        member.type === 'TSMethodSignature'
      ) {
        return member.kind === 'get' || member.kind === 'set' ? 'Properties' : 'Methods';
      }
      if (
        member.type === 'PropertyDefinition' ||
        member.type === 'TSAbstractPropertyDefinition' ||
        member.type === 'TSPropertySignature'
      )
        return 'Properties';
      return null;
    }

    function commentsBefore(member) {
      return source.getCommentsBefore(member.decorators?.[0] ?? member);
    }

    function inspectGroup(group, region) {
      const first = group[0];
      const comments = commentsBefore(first);
      const doc = comments.at(-1);
      const opener = comments.at(-2);
      if (
        !doc ||
        doc.type !== 'Block' ||
        !doc.value.startsWith('*') ||
        !opener ||
        opener.type !== 'Line' ||
        opener.value.trim() !== `#region ${region}` ||
        opener.loc.end.line + 1 !== doc.loc.start.line
      )
        context.report({ node: first, messageId: 'open', data: { region } });

      for (let index = 1; index < group.length; index += 1) {
        const member = group[index];
        const memberDoc = commentsBefore(member).at(-1);
        if (
          memberDoc?.type === 'Block' &&
          memberDoc.value.startsWith('*') &&
          memberDoc.loc.start.line !== group[index - 1].loc.end.line + 2
        )
          context.report({ node: member, messageId: 'separation' });
      }

      const last = group.at(-1);
      const closer = source.getCommentsAfter(last)[0];
      if (
        !closer ||
        closer.type !== 'Line' ||
        closer.value.trim() !== '#endregion' ||
        closer.loc.start.line !== last.loc.end.line + 1
      )
        context.report({ node: last, messageId: 'close' });
    }

    function inspectContainer(node) {
      if (node.type === 'ClassBody' && node.parent.type !== 'ClassDeclaration') return;
      if (node.type === 'TSTypeLiteral' && node.parent.type !== 'TSTypeAliasDeclaration') return;
      const members = node.body ?? node.members;
      let group = [];
      let current = null;
      for (const member of members) {
        const region = category(member);
        if (region !== current) {
          if (group.length) inspectGroup(group, current);
          group = [];
          current = region;
        }
        if (region) group.push(member);
      }
      if (group.length) inspectGroup(group, current);
    }

    function inspectMarkers() {
      const stack = [];
      const allowed = new Set(['Traits', 'Properties', 'Constructor', 'Methods']);
      for (const comment of source.getAllComments()) {
        if (comment.type !== 'Line') continue;
        const value = comment.value.trim();
        if (!/^#(?:end)?region\b/u.test(value)) continue;

        const owner = source.getNodeByRangeIndex(comment.range[0]);
        const insideMemberContainer =
          owner?.type === 'ClassBody' ||
          owner?.type === 'TSInterfaceBody' ||
          (owner?.type === 'TSTypeLiteral' && owner.parent.type === 'TSTypeAliasDeclaration');
        if (!insideMemberContainer) context.report({ loc: comment.loc, messageId: 'marker' });

        if (value.startsWith('#endregion')) {
          if (value !== '#endregion') context.report({ loc: comment.loc, messageId: 'marker' });
          if (!stack.pop()) context.report({ loc: comment.loc, messageId: 'unbalanced' });
        } else {
          const match = /^#region (\S+)$/u.exec(value);
          if (!match || !allowed.has(match[1]))
            context.report({ loc: comment.loc, messageId: 'marker' });
          stack.push(comment);
        }
      }
      for (const comment of stack) context.report({ loc: comment.loc, messageId: 'unbalanced' });
    }

    return {
      ClassBody: inspectContainer,
      TSInterfaceBody: inspectContainer,
      TSTypeLiteral: inspectContainer,
      'Program:exit': inspectMarkers,
    };
  },
};

export default uiMemberRegions;

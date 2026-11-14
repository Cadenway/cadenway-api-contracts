import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { ESLint, Linter, RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import documentation from './documentation.mjs';
import memberRegions from './member-regions.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

it('enforces the configured JSDoc checks on authored TypeScript', async () => {
  const file = existsSync('src/main.ts')
    ? 'src/main.ts'
    : existsSync('packages/nest-common/src/health/health.controller.ts')
      ? 'packages/nest-common/src/health/health.controller.ts'
      : 'test/spectral/ruleset.spec.ts';
  const config = await new ESLint().calculateConfigForFile(file);
  const rules = Object.fromEntries(
    Object.entries(config.rules).filter(([name]) => name.startsWith('jsdoc/')),
  );
  const linter = new Linter();
  const lint = (code) =>
    linter.verify(code, {
      languageOptions: { parser: tseslint.parser },
      plugins: { jsdoc: config.plugins.jsdoc },
      rules,
    });
  assert(
    lint('export class Example {}').some((message) => message.ruleId === 'jsdoc/require-jsdoc'),
  );
  const callable = lint(
    '/** Normalizes a label. */\nfunction fold(label: string): string { return label; }',
  );
  assert(callable.some((message) => message.ruleId === 'jsdoc/require-param'));
  assert(callable.some((message) => message.ruleId === 'jsdoc/require-returns'));
});

tester.run('documentation', documentation, {
  valid: [
    {
      code: '/**\n * Class Example\n *\n * @description\n * Holds the example.\n */\nclass Example {}',
    },
  ],
  invalid: [{ code: '/** Example. */\nclass Example {}', errors: [{ messageId: 'structure' }] }],
});

tester.run('member-regions', memberRegions, {
  valid: [
    {
      code: 'class Example {\n  // #region Properties\n  /** Property. */\n  public value: string = "";\n  // #endregion\n}',
    },
  ],
  invalid: [
    {
      code: 'class Example { public value: string = ""; }',
      errors: [{ messageId: 'open' }, { messageId: 'close' }],
    },
  ],
});

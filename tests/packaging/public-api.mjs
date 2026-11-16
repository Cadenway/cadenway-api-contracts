import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import ts from 'typescript';

/**
 * Expands the manifest against the installed artefact. This records the contract seen by
 * consumers, including concrete subpaths behind wildcard exports.
 */
export function publicEntries(directory) {
  const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  const typed = new Set();
  const assets = new Set();
  const paths = readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).replaceAll('\\', '/'));
  assert.ok(Object.keys(manifest.exports).length, `${manifest.name} has no public entries`);
  for (const [specifier, entry] of Object.entries(manifest.exports)) {
    const target = typeof entry === 'string' ? entry : (entry.types ?? entry.default);
    const entries = typeof entry === 'object' && entry.types ? typed : assets;
    const [prefix, suffix = ''] = target.slice(2).split('*');
    if (!target.includes('*')) {
      assert.ok(paths.includes(prefix), `${manifest.name} is missing ${target}`);
      entries.add(specifier);
      continue;
    }
    let matches = 0;
    for (const path of paths) {
      if (path.startsWith(prefix) && path.endsWith(suffix)) {
        const end = suffix ? -suffix.length : undefined;
        entries.add(specifier.replace('*', path.slice(prefix.length, end)));
        matches++;
      }
    }
    assert.ok(matches, `${manifest.name}: ${specifier} resolved to no installed files`);
  }
  return { typed, assets };
}

function importsFor(matrix) {
  return matrix.flatMap(({ name, baseline, entries }) =>
    entries.flatMap((entry) => {
      const suffix = entry === '.' ? '' : entry.slice(1);
      return [`${baseline}${suffix}`, `${name}${suffix}`];
    }),
  );
}

/** Checks every published name and its declaration in a joint TypeScript program. */
export function compareDeclarations(directory, matrix) {
  const file = join(directory, 'public-api.ts');
  const imports = importsFor(matrix);
  writeFileSync(
    file,
    imports
      .map((name, index) => `import * as entry${index} from ${JSON.stringify(name)};`)
      .join('\n'),
  );
  const options = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2023,
    module: ts.ModuleKind.NodeNext,
    types: [],
    paths: legacyRxjsTypes(directory),
  };
  const names = new Set(matrix.map(({ name }) => name));
  const program = ts.createProgram([file], options, separateArchives(directory, options, names));
  const errors = ts.getPreEmitDiagnostics(program);
  if (errors.length) {
    assert.fail(
      ts.formatDiagnosticsWithColorAndContext(errors, {
        getCanonicalFileName: (name) => name,
        getCurrentDirectory: () => dirname(file),
        getNewLine: () => '\n',
      }),
    );
  }
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  assert.ok(source);
  const modules = source.statements.map((statement) => {
    assert.ok(ts.isImportDeclaration(statement));
    const module = checker.getSymbolAtLocation(statement.moduleSpecifier);
    assert.ok(module, `Unresolved entry ${statement.moduleSpecifier.getText()}`);
    return module;
  });
  const changes = [];
  for (let index = 0; index < modules.length; index += 2) {
    assert.notEqual(
      modules[index],
      modules[index + 1],
      `Merged archives for ${imports[index + 1]}`,
    );
    const next = new Map(
      checker
        .getExportsOfModule(modules[index + 1])
        .map((symbol) => [symbol.name, unalias(checker, symbol)]),
    );
    for (const symbol of checker.getExportsOfModule(modules[index])) {
      const previous = unalias(checker, symbol);
      const candidate = next.get(symbol.name);
      const label = `${imports[index + 1]}#${symbol.name}`;
      if (!candidate) {
        changes.push(`${label} was removed`);
        continue;
      }
      compareExport(checker, previous, candidate, label, changes);
    }
  }
  assert.deepEqual(changes, [], 'Published declaration surface changed');
}

function separateArchives(directory, options, names) {
  const host = ts.createCompilerHost(options);
  const cache = ts.createModuleResolutionCache(directory, host.getCanonicalFileName, options);
  host.resolveModuleNameLiterals = (literals, file, redirect, compilerOptions, source) =>
    literals.map((literal) => {
      const mode = ts.getModeForUsageLocation(source, literal, compilerOptions);
      const result = ts.resolveModuleName(
        literal.text,
        file,
        compilerOptions,
        host,
        cache,
        redirect,
        mode,
      );
      if (!names.has(result.resolvedModule?.packageId?.name)) return result;
      // TypeScript otherwise merges declarations sharing a package name and version. PRs
      // often keep the released version until Changesets produces the next release.
      return { ...result, resolvedModule: { ...result.resolvedModule, packageId: undefined } };
    });
  return host;
}

function legacyRxjsTypes(directory) {
  const root = join(directory, 'node_modules', 'rxjs');
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (manifest.exports?.['.']?.types) return undefined;
  // RxJS 7.4's typesVersions redirects its declarations to dist/types, but TypeScript
  // ignores that redirect when resolving the legacy exports map.
  return { rxjs: [join(root, 'dist/types', manifest.types)] };
}

function unalias(checker, symbol) {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function compareExport(checker, previous, candidate, label, changes) {
  const kinds = ts.SymbolFlags.Type | ts.SymbolFlags.Value;
  if ((previous.flags & kinds & candidate.flags) !== (previous.flags & kinds)) {
    changes.push(`${label} changed export kind`);
    return;
  }
  if ((previous.flags & ts.SymbolFlags.Class) !== 0) {
    // Angular services have private fields. Compare public members and constructor arguments
    // without demanding nominal equality between two independently installed class declarations.
    const oldType = checker.getDeclaredTypeOfSymbol(previous);
    const newType = checker.getDeclaredTypeOfSymbol(candidate);
    for (const member of checker.getPropertiesOfType(oldType).filter(isPublic)) {
      const next = checker.getPropertyOfType(newType, member.name);
      if (
        !next ||
        !isPublic(next) ||
        !checker.isTypeAssignableTo(symbolType(checker, next), symbolType(checker, member))
      ) {
        changes.push(`${label}.${member.name} changed public member type`);
      }
    }
    const oldConstructors = symbolType(checker, previous).getConstructSignatures();
    const newConstructors = symbolType(checker, candidate).getConstructSignatures();
    const parameters = (signature) =>
      signature
        .getParameters()
        .map((param) => [
          checker.typeToString(symbolType(checker, param)),
          Boolean(param.valueDeclaration?.questionToken || param.valueDeclaration?.initializer),
          Boolean(param.valueDeclaration?.dotDotDotToken),
        ]);
    for (const constructor of oldConstructors) {
      const signature = JSON.stringify(parameters(constructor));
      if (!newConstructors.some((next) => JSON.stringify(parameters(next)) === signature)) {
        changes.push(`${label} changed constructor parameters`);
      }
    }
    return;
  }
  if (previous.flags & ts.SymbolFlags.Type) {
    const oldType = checker.getDeclaredTypeOfSymbol(previous);
    const newType = checker.getDeclaredTypeOfSymbol(candidate);
    if (
      !checker.isTypeAssignableTo(newType, oldType) ||
      !checker.isTypeAssignableTo(oldType, newType)
    ) {
      changes.push(`${label} changed type`);
    }
  }
  if (
    previous.flags & ts.SymbolFlags.Value &&
    !checker.isTypeAssignableTo(symbolType(checker, candidate), symbolType(checker, previous))
  ) {
    changes.push(`${label} changed value signature`);
  }
}

function symbolType(checker, symbol) {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  assert.ok(declaration, `Missing declaration for ${symbol.name}`);
  return checker.getTypeOfSymbolAtLocation(symbol, declaration);
}

function isPublic(symbol) {
  const hidden = ts.ModifierFlags.Private | ts.ModifierFlags.Protected;
  return symbol.declarations?.every((node) => (ts.getCombinedModifierFlags(node) & hidden) === 0);
}

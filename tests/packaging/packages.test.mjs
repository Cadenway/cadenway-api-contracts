import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { compareDeclarations, publicEntries } from './public-api.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const baseline = JSON.parse(readFileSync(new URL('./published-api.json', import.meta.url), 'utf8'));
const requireFromRoot = createRequire(join(root, 'package.json'));
const tooling = [
  '@angular/build',
  '@angular/cli',
  '@angular/common',
  '@angular/compiler',
  '@angular/compiler-cli',
  '@angular/core',
  'rxjs',
  'typescript',
];
const packages = Object.keys(baseline).map((name) => {
  const folder = name.split('/')[1];
  return {
    name,
    folder,
    archive: folder + '.tgz',
    previous: '@cadenway/published-' + folder,
  };
});

function writeJson(file, json) {
  writeFileSync(file, JSON.stringify(json, null, 2));
}

function pnpm(cwd, ...args) {
  const executable = process.env.npm_execpath;
  assert.ok(executable, 'Run this suite through pnpm test:packaging');
  const nodeScript = /\.[cm]?js$/iu.test(executable);
  execFileSync(
    nodeScript ? process.execPath : executable,
    nodeScript ? [executable, ...args] : args,
    {
      cwd,
      stdio: 'inherit',
    },
  );
}

function installedVersions() {
  const versions = Object.fromEntries(
    tooling.map((name) => [
      name,
      JSON.parse(readFileSync(requireFromRoot.resolve(name + '/package.json'), 'utf8')).version,
    ]),
  );
  return { ...versions, '@angular/platform-browser': versions['@angular/core'] };
}

function minimumPeerVersion(range) {
  const version = /^\^(\d+\.\d+\.\d+)$/u.exec(range)?.[1];
  assert.ok(version, 'Declare the test version for peer range ' + range);
  return version;
}

function minimumVersions(versions) {
  const { peerDependencies } = JSON.parse(
    readFileSync(join(root, 'packages/api-client/package.json'), 'utf8'),
  );
  const angularVersion = minimumPeerVersion(peerDependencies['@angular/core']);
  return {
    ...versions,
    '@angular/build': angularVersion,
    '@angular/cli': angularVersion,
    '@angular/compiler': angularVersion,
    '@angular/compiler-cli': angularVersion,
    '@angular/common': minimumPeerVersion(peerDependencies['@angular/common']),
    '@angular/core': angularVersion,
    '@angular/platform-browser': angularVersion,
    rxjs: minimumPeerVersion(peerDependencies.rxjs),
  };
}

function createConsumer(scratch, label, versions) {
  const directory = join(scratch, label);
  mkdirSync(directory);
  copyFileSync(join(root, 'pnpm-workspace.yaml'), join(directory, 'pnpm-workspace.yaml'));
  appendFileSync(
    join(directory, 'pnpm-workspace.yaml'),
    '\nautoInstallPeers: false\nhoist: false\n',
  );
  writeFileSync(join(directory, '.npmrc'), '@cadenway:registry=https://npm.pkg.github.com\n');
  const dependencies = { ...versions };
  for (const { name, archive, previous } of packages) {
    copyFileSync(join(scratch, archive), join(directory, archive));
    dependencies[name] = './' + archive;
    dependencies[previous] = 'npm:' + name + '@' + baseline[name];
  }
  writeJson(join(directory, 'package.json'), {
    name: 'contracts-packaging-' + label,
    private: true,
    type: 'module',
    dependencies,
  });
  pnpm(
    directory,
    'install',
    '--no-frozen-lockfile',
    '--strict-peer-dependencies',
    '--ignore-scripts',
    '--prefer-offline',
  );
  return directory;
}

function checkPackages(directory) {
  const runtime = { entries: [], specs: [] };
  const matrix = [];
  for (const { name, previous } of packages) {
    const installed = join(directory, 'node_modules', name);
    const oldEntries = publicEntries(join(directory, 'node_modules', previous));
    const newEntries = publicEntries(installed);
    for (const entry of oldEntries.assets) {
      assert.ok(newEntries.assets.has(entry), name + ' no longer ships ' + entry);
    }
    for (const entry of oldEntries.typed) {
      assert.ok(newEntries.typed.has(entry), name + ' no longer exports ' + entry);
    }
    const files = readdirSync(installed, { recursive: true, withFileTypes: true });
    const leaked = files.filter(
      (entry) =>
        ['test', 'tests', 'coverage'].includes(entry.name) ||
        /\.(?:spec|test)\.[cm]?[jt]s$|\.tsbuildinfo$/u.test(entry.name),
    );
    assert.deepEqual(
      leaked.map((entry) => entry.name),
      [],
      name + ' ships development files',
    );
    matrix.push({ name, baseline: previous, entries: [...oldEntries.typed] });
    if (name === '@cadenway/contracts') {
      runtime.entries = [...newEntries.typed].map((entry) =>
        entry === '.' ? name : name + entry.slice(1),
      );
      runtime.specs = [...newEntries.assets]
        .filter((entry) => entry.startsWith('./specs/'))
        .map((entry) => name + entry.slice(1));
    }
  }
  compareDeclarations(directory, matrix);
  writeJson(join(directory, 'runtime-entries.json'), runtime);
  copyFileSync(
    fileURLToPath(new URL('./runtime.fixture', import.meta.url)),
    join(directory, 'smoke.mjs'),
  );
  execFileSync(process.execPath, ['smoke.mjs'], { cwd: directory, stdio: 'inherit' });
}

function buildAngularConsumer(directory) {
  writeJson(join(directory, 'angular.json'), {
    version: 1,
    cli: { analytics: false },
    projects: {
      consumer: {
        projectType: 'application',
        root: '',
        architect: {
          build: {
            builder: '@angular/build:application',
            defaultConfiguration: 'production',
            options: {
              browser: 'main.ts',
              index: 'index.html',
              outputPath: 'dist',
              tsConfig: 'tsconfig.json',
            },
            configurations: { production: { optimization: true, aot: true } },
          },
        },
      },
    },
  });
  writeJson(join(directory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2023',
      module: 'preserve',
      moduleResolution: 'bundler',
      strict: true,
      // Match the repository's Angular compiler settings. The separate API comparison checks
      // the installed declaration files, including the RxJS peer at its declared floor.
      skipLibCheck: true,
      experimentalDecorators: true,
      types: [],
    },
    angularCompilerOptions: { strictTemplates: true },
    files: ['main.ts'],
  });
  copyFileSync(
    fileURLToPath(new URL('./angular.fixture', import.meta.url)),
    join(directory, 'main.ts'),
  );
  writeFileSync(
    join(directory, 'index.html'),
    '<!doctype html><html><head></head><body><smoke-root></smoke-root></body></html>',
  );
  const require = createRequire(join(directory, 'package.json'));
  const ng = join(dirname(require.resolve('@angular/cli/package.json')), 'bin/ng.js');
  execFileSync(process.execPath, [ng, 'build', '--configuration', 'production'], {
    cwd: directory,
    stdio: 'inherit',
  });
}

test('published contract archives resolve and compile in a standalone consumer', async (context) => {
  const base = realpathSync(tmpdir());
  const scratch = mkdtempSync(join(base, 'cadenway-api-packaging-'));
  try {
    for (const { folder, archive } of packages) {
      pnpm(join(root, 'packages', folder), 'pack', '--out', join(scratch, archive));
    }
    const current = installedVersions();
    const minimum = minimumVersions(current);
    for (const [label, versions] of [
      ['current', current],
      ['minimum', minimum],
    ]) {
      if (label === 'minimum' && JSON.stringify(current) === JSON.stringify(minimum)) continue;
      await context.test(label + ' peers', () => {
        const directory = createConsumer(scratch, label, versions);
        checkPackages(directory);
        buildAngularConsumer(directory);
      });
    }
  } finally {
    assert.equal(dirname(realpathSync(scratch)), base);
    rmSync(scratch, { recursive: true, force: true, maxRetries: 3 });
  }
});

/**
 * Helpers shared by the spec scripts (`lint:specs`, `breaking`, `generate`, `docs:build`): where
 * the repository is, which files are spec documents, and how a local tool is started.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path of the repository root. */
export const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

const SPEC_EXTENSIONS = new Set(['.yaml', '.yml', '.json']);

/**
 * Tells whether a file is a root document of the given kind, by its top-level `openapi` or
 * `asyncapi` version key. Fragments referenced through `$ref` (shared schemas, parameters) carry no
 * such key and are therefore never linted, compared or generated on their own.
 *
 * @param {string} file Name of the file; its extension selects JSON or YAML reading.
 * @param {string} text Content of the file.
 * @param {'openapi' | 'asyncapi'} kind Document kind to recognize.
 * @returns {boolean}
 */
export function isRootDocument(file, text, kind) {
  if (path.extname(file).toLowerCase() === '.json') {
    try {
      return typeof JSON.parse(text)?.[kind] === 'string';
    } catch {
      // Unreadable JSON is kept so the tool that receives it reports the syntax error.
      return true;
    }
  }
  // A top-level YAML key starts its line; an indented one belongs to a nested mapping.
  return new RegExp(`^["']?${kind}["']?\\s*:`, 'm').test(text);
}

/**
 * Lists every file below a directory, as sorted paths relative to it with forward slashes. A
 * missing directory yields an empty list.
 *
 * @param {string} directory Absolute directory to walk.
 * @returns {string[]}
 */
export function listFiles(directory) {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  const found = [];
  const walk = (current, prefix) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(current, entry.name), relative);
      else if (entry.isFile()) found.push(relative);
    }
  };
  walk(directory, '');
  return found.sort();
}

/**
 * Lists the root documents of one kind below a directory, as sorted relative paths with forward
 * slashes. The order is stable so generated output does not depend on the file system.
 *
 * @param {string} directory Absolute directory to search.
 * @param {'openapi' | 'asyncapi'} kind Document kind to keep.
 * @returns {string[]}
 */
export function listSpecFiles(directory, kind) {
  return listFiles(directory).filter(
    (relative) =>
      SPEC_EXTENSIONS.has(path.extname(relative).toLowerCase()) &&
      isRootDocument(relative, readFileSync(path.join(directory, relative), 'utf8'), kind),
  );
}

/**
 * Reads `--name value` options from a command line. Unknown options and missing values stop the
 * script, so a typo never silently falls back to a default directory.
 *
 * @param {string[]} argv Arguments after the script name.
 * @param {Record<string, string>} defaults Accepted option names with their default value.
 * @returns {{ options: Record<string, string>, positionals: string[] }}
 */
export function parseArguments(argv, defaults) {
  const options = { ...defaults };
  const positionals = [];
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--') continue;
    if (!argument.startsWith('--')) {
      positionals.push(argument);
      continue;
    }
    const name = argument.slice(2);
    const value = argv[index + 1];
    if (!(name in defaults) || value === undefined) {
      throw new Error(`Unknown option or missing value: ${argument}`);
    }
    options[name] = value;
    index += 1;
  }
  return { options, positionals };
}

/**
 * Runs a JavaScript entry point of an installed tool with the current Node.js binary, without a
 * shell, so paths with spaces and Windows separators reach the tool unchanged.
 *
 * @param {string} entry Path of the tool entry point, relative to the repository root.
 * @param {string[]} args Arguments of the tool.
 * @param {NodeJS.ProcessEnv} [env] Variables added to the environment of the tool.
 * @returns {number} Exit status of the tool; 1 when it could not be started.
 */
export function runTool(entry, args, env = {}) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, entry), ...args], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  return result.status ?? 1;
}

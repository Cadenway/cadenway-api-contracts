import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path of the repository root, where every script is started. */
export const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** Outcome of a child process: its exit status and everything it printed. */
export interface RunResult {
  readonly status: number;
  readonly output: string;
}

/**
 * Runs a JavaScript file of the repository with the current Node.js binary, from the repository
 * root, and captures its output instead of throwing: a test asserts on the status itself.
 *
 * @param entry Path of the file, relative to the repository root.
 * @param args Arguments passed to it.
 */
export function runNode(entry: string, args: readonly string[] = []): RunResult {
  const result = spawnSync(process.execPath, [path.join(repoRoot, entry), ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return { status: result.status ?? 1, output: `${result.stdout}${result.stderr}` };
}

/**
 * Creates an empty directory for the output of one test.
 *
 * It lives below `.cache/` of the repository rather than in the system temporary folder: generated
 * code imports `zod` and `@angular/core`, which only resolve from inside the repository. The folder
 * is ignored by Git and Prettier; the caller removes it when done.
 */
export function createWorkspace(): string {
  const parent = path.join(repoRoot, '.cache', 'pipeline-tests');
  mkdirSync(parent, { recursive: true });
  return mkdtempSync(path.join(parent, 'run-'));
}

/**
 * Lists the files below a directory as sorted paths relative to it, with forward slashes. A missing
 * directory yields an empty list.
 */
export function listTree(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(directory, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'),
    )
    .sort();
}

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['apps', 'packages'];
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', 'coverage']);
const SOURCE_FILE = /\.(ts|tsx)$/;
const REEXPORT = /^\s*export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s/m;

const listSources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : listSources(path);
    }
    return SOURCE_FILE.test(entry.name) && entry.name !== 'routeTree.gen.ts' ? [path] : [];
  });

const offenders = ROOTS.flatMap(listSources).filter((path) =>
  REEXPORT.test(readFileSync(path, 'utf8')),
);

if (offenders.length > 0) {
  console.error(
    `Re-exports are not allowed (import from the source file):\n${offenders.join('\n')}`,
  );
  process.exitCode = 1;
}

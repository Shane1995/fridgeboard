import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  REEXPORT,
  REEXPORT_ERROR,
  ROOTS,
  SKIPPED_DIRECTORIES,
  SKIPPED_FILE,
  SOURCE_FILE,
} from './constants.ts';

const listSources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : listSources(path);
    }
    return SOURCE_FILE.test(entry.name) && entry.name !== SKIPPED_FILE ? [path] : [];
  });

const offenders = ROOTS.flatMap(listSources).filter((path) =>
  REEXPORT.test(readFileSync(path, 'utf8')),
);

if (offenders.length > 0) {
  console.error(`${REEXPORT_ERROR}\n${offenders.join('\n')}`);
  process.exitCode = 1;
}

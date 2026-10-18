import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REEXPORT, SKIPPED_DIRECTORIES, SKIPPED_FILE, SOURCE_FILE } from '../constants.ts';

const listSources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : listSources(path);
    }
    return SOURCE_FILE.test(entry.name) && entry.name !== SKIPPED_FILE ? [path] : [];
  });

export const findReexports = (roots: string[]): string[] =>
  roots.flatMap(listSources).filter((path) => REEXPORT.test(readFileSync(path, 'utf8')));

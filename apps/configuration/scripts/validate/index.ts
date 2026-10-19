import { readFileSync } from 'node:fs';
import { TARGETS } from './constants.ts';
import { validateConfiguration } from './validateConfiguration/index.ts';

const errors = TARGETS.flatMap((target) =>
  validateConfiguration(target, readFileSync(target.file, 'utf8')),
);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}

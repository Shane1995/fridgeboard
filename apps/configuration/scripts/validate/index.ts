import { readFileSync } from 'node:fs';
import { TARGETS } from './constants.ts';
import { findSettingMismatches } from './findSettingMismatches/index.ts';
import { validateConfiguration } from './validateConfiguration/index.ts';

const contents = TARGETS.map((target) => readFileSync(target.file, 'utf8'));

const fileErrors = TARGETS.flatMap((target, index) =>
  validateConfiguration(target, contents[index] ?? ''),
);

const errors =
  fileErrors.length > 0
    ? fileErrors
    : findSettingMismatches(JSON.parse(contents[0] ?? ''), JSON.parse(contents[1] ?? ''));

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LICENSE_FILE_PATTERN,
  MISSING_LICENSE_TEXT,
  OUTPUT_FILE,
  SHIPPED_DEV_PACKAGES,
} from './constants.ts';
import type { PnpmLicenses } from './types.ts';
import { formatNotices } from './utils/formatNotices/index.ts';
import { selectPackages } from './utils/selectPackages/index.ts';

const listLicenses = (args: string[]): PnpmLicenses =>
  JSON.parse(execFileSync('pnpm', ['licenses', 'list', '--json', ...args], { encoding: 'utf8' }));

const readLicenseText = (path: string): string => {
  const file = readdirSync(path).find((name) => LICENSE_FILE_PATTERN.test(name));
  return file ? readFileSync(join(path, file), 'utf8') : MISSING_LICENSE_TEXT;
};

const packages = selectPackages(listLicenses(['--prod']), listLicenses([]), SHIPPED_DEV_PACKAGES);
const notices = packages.map(({ path, ...pkg }) => ({ ...pkg, text: readLicenseText(path) }));

writeFileSync(OUTPUT_FILE, formatNotices(notices));
console.log(`Wrote ${notices.length} third-party notices to ${OUTPUT_FILE}`);

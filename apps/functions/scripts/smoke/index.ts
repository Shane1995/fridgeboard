import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { OUT_DIR } from '../build/constants.ts';
import { BUNDLE_FILE } from './constants.ts';

const bundles = readdirSync(OUT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => resolve(OUT_DIR, entry.name, BUNDLE_FILE));

await Promise.all(bundles.map((bundle) => import(pathToFileURL(bundle).href)));

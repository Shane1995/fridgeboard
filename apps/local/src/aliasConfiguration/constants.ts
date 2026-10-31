import { resolve } from 'node:path';

export const FUNCTIONS_CONFIGURATION = resolve(
  import.meta.dirname,
  '../../../functions/src/configuration/index.ts',
);
export const LOCAL_CONFIGURATION = resolve(import.meta.dirname, '../localConfiguration/index.ts');

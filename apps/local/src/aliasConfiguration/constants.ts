import { resolve } from 'node:path';

export const FUNCTIONS_CONFIGURATION = resolve(
  import.meta.dirname,
  '../../../../packages/lambda-kit/src/configuration/index.ts',
);
export const FUNCTIONS_CONFIGURATION_SPECIFIER = '@fridgeboard/lambda-kit/configuration/index.ts';
export const LOCAL_CONFIGURATION = resolve(import.meta.dirname, '../localConfiguration/index.ts');

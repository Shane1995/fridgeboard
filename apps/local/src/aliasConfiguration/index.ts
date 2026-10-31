import { resolve } from 'node:path';
import type { Plugin } from 'esbuild';
import { FUNCTIONS_CONFIGURATION, LOCAL_CONFIGURATION } from './constants.ts';

export const aliasConfiguration: Plugin = {
  name: 'alias-configuration',
  setup: (build) => {
    build.onResolve({ filter: /configuration\/index\.ts$/ }, ({ path, resolveDir }) =>
      resolve(resolveDir, path) === FUNCTIONS_CONFIGURATION
        ? { path: LOCAL_CONFIGURATION }
        : undefined,
    );
  },
};

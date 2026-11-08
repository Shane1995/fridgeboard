import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BUILD_CONFIG_FILE } from '../constants.ts';
import type { BuildConfig } from '../types.ts';

export const loadBuildConfig = async (dir: string): Promise<BuildConfig> => {
  const file = join(dir, BUILD_CONFIG_FILE);

  if (!existsSync(file)) {
    return {};
  }

  const loaded: { buildConfig?: BuildConfig } = await import(pathToFileURL(file).href);

  return loaded.buildConfig ?? {};
};

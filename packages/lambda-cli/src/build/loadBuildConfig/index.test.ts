import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BUILD_CONFIG_FILE } from '../constants.ts';
import { loadBuildConfig } from './index.ts';

describe('loadBuildConfig', () => {
  let dir = '';

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'build-config-'));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns no overrides when the Lambda has no build config', async () => {
    expect(await loadBuildConfig(dir)).toEqual({});
  });

  it('returns the exported buildConfig', async () => {
    writeFileSync(join(dir, BUILD_CONFIG_FILE), `export const buildConfig = { minify: false };`);

    expect(await loadBuildConfig(dir)).toEqual({ minify: false });
  });

  it('returns no overrides when the file exports no buildConfig', async () => {
    writeFileSync(join(dir, BUILD_CONFIG_FILE), `export const other = 1;`);

    expect(await loadBuildConfig(dir)).toEqual({});
  });
});

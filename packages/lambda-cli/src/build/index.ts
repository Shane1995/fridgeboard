#!/usr/bin/env node
import { build } from 'esbuild';
import { ENTRY_FILE, ESM_REQUIRE_BANNER, OUT_FILE } from './constants.ts';
import { loadBuildConfig } from './loadBuildConfig/index.ts';

const overrides = await loadBuildConfig(process.cwd());

await build({
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  minify: true,
  sourcemap: false,
  banner: { js: ESM_REQUIRE_BANNER },
  ...overrides,
  entryPoints: [ENTRY_FILE],
  outfile: OUT_FILE,
});

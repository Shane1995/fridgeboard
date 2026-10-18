import { existsSync, readdirSync } from 'node:fs';
import { build } from 'esbuild';
import { HANDLERS_DIR, OUT_DIR } from './constants.ts';

const handlers = readdirSync(HANDLERS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(`${HANDLERS_DIR}/${name}/index.ts`));

await Promise.all(
  handlers.map((name) =>
    build({
      entryPoints: [`${HANDLERS_DIR}/${name}/index.ts`],
      outfile: `${OUT_DIR}/${name}/index.mjs`,
      bundle: true,
      platform: 'node',
      target: 'node24',
      format: 'esm',
      minify: true,
      sourcemap: false,
    }),
  ),
);

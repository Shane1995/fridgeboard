import { execFileSync, spawn } from 'node:child_process';
import { build } from 'esbuild';
import {
  DEV_ENV,
  DYNAMO_SERVICE,
  ESM_REQUIRE_BANNER,
  SERVER_BUNDLE,
  SERVER_ENTRY,
} from './constants.ts';

execFileSync('docker', ['compose', 'up', '--detach', '--wait', DYNAMO_SERVICE], {
  stdio: 'inherit',
});

await build({
  entryPoints: [SERVER_ENTRY],
  outfile: SERVER_BUNDLE,
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  sourcemap: 'inline',
  banner: { js: ESM_REQUIRE_BANNER },
});

const env = { ...process.env, ...DEV_ENV };
const children = [
  spawn('node', ['--enable-source-maps', SERVER_BUNDLE], { stdio: 'inherit', env }),
  spawn('pnpm', ['--filter', '@fridgeboard/web', 'dev'], {
    stdio: 'inherit',
    env: { ...env, DEV_LOCAL: '1' },
  }),
];

const stop = (): void => {
  children.forEach((child) => child.kill('SIGTERM'));
};
children.forEach((child) => child.on('exit', stop));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

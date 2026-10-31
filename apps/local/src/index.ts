import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';
import {
  COMPOSE_FILE,
  DEV_ENV,
  ENV_FILE,
  ESM_REQUIRE_BANNER,
  LOCALSTACK_SERVICE,
  SERVER_BUNDLE,
  SERVER_ENTRY,
  TOKEN_HINT,
  TOKEN_VARIABLE,
} from './constants.ts';

if (existsSync(ENV_FILE)) {
  process.loadEnvFile(ENV_FILE);
}

if (!process.env[TOKEN_VARIABLE]) {
  console.error(TOKEN_HINT);
  process.exit(1);
}

execFileSync(
  'docker',
  ['compose', '-f', COMPOSE_FILE, 'up', '--detach', '--wait', LOCALSTACK_SERVICE],
  { stdio: 'inherit' },
);

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

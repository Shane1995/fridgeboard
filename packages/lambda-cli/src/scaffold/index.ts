#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { LAMBDAS_DIR, PACKAGE_PREFIX } from './constants.ts';
import { kebabCase } from './kebabCase/index.ts';
import { parseScaffoldArgs } from './parseScaffoldArgs/index.ts';
import { renderLambda } from './renderLambda/index.ts';
import { renderStarter } from './renderStarter/index.ts';

const { name, kind } = parseScaffoldArgs(process.argv.slice(2));
const target = resolve(LAMBDAS_DIR, name);

if (existsSync(target)) {
  throw new Error(`${target} already exists`);
}

const files = { ...renderLambda({ name, kind }), ...renderStarter() };

Object.entries(files).forEach(([path, content]) => {
  mkdirSync(dirname(resolve(target, path)), { recursive: true });
  writeFileSync(resolve(target, path), content);
});

console.log(
  `Created ${target}. Next: add it to local.functions in terraform-cloud-infra, run pnpm install, then pnpm --filter ${PACKAGE_PREFIX}${kebabCase(name)} test.`,
);

import { BASE_DEV_DEPENDENCIES, FUNCTION_PREFIX, PACKAGE_PREFIX } from '../constants.ts';
import { kebabCase } from '../kebabCase/index.ts';
import type { LambdaSpec } from './types.ts';

const sortKeys = (record: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(record).toSorted(([a], [b]) => a.localeCompare(b)));

export const renderLambda = ({
  name,
  kind,
  dependencies = {},
  devDependencies = {},
}: LambdaSpec): Record<string, string> => {
  const slug = kebabCase(name);
  const functionName = `${FUNCTION_PREFIX}${slug}`;
  const manifest = {
    name: `${PACKAGE_PREFIX}${slug}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    lambda: { kind },
    exports: { '.': './src/index.ts', './*': './src/*' },
    scripts: {
      build: 'lambda-build',
      smoke: 'lambda-smoke',
      typecheck: 'tsc -b',
      test: 'vitest run',
      lint: 'oxlint --config ../../../.oxlintrc.json src/',
      format: 'oxfmt src/',
      'format:check': 'oxfmt --check src/',
    },
    ...(Object.keys(dependencies).length > 0 ? { dependencies: sortKeys(dependencies) } : {}),
    devDependencies: sortKeys({ ...BASE_DEV_DEPENDENCIES, ...devDependencies }),
  };
  const tsconfig = {
    extends: '../../../tsconfig.base.json',
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.tsbuildinfo',
      lib: ['es2023', 'esnext.array'],
      types: ['node', 'vitest/globals'],
    },
    include: ['src', 'build.config.ts', 'vitest.config.ts'],
  };

  return {
    'package.json': `${JSON.stringify(manifest, null, 2)}\n`,
    'tsconfig.json': `${JSON.stringify(tsconfig, null, 2)}\n`,
    '.deployment': `${functionName}\n`,
    'vitest.config.ts': [
      "import { defineConfig } from 'vitest/config';",
      '',
      'export default defineConfig({',
      '  test: {',
      "    environment: 'node',",
      '    globals: true,',
      "    include: ['src/**/*.test.ts'],",
      '  },',
      '});',
      '',
    ].join('\n'),
    'build.config.ts': [
      "import type { BuildConfig } from '@fridgeboard/lambda-cli/build/types.ts';",
      '',
      'export const buildConfig: BuildConfig = {};',
      '',
    ].join('\n'),
    Makefile: [
      '.PHONY: build smoke test typecheck lint',
      '',
      'build:',
      '\tpnpm build',
      '',
      'smoke: build',
      '\tpnpm smoke',
      '',
      'test:',
      '\tpnpm test',
      '',
      'typecheck:',
      '\tpnpm typecheck',
      '',
      'lint:',
      '\tpnpm lint',
      '',
    ].join('\n'),
    'README.md': [
      `# ${name}`,
      '',
      `The \`${functionName}\` Lambda (${kind}). Deployed by \`.github/workflows/functions.yml\` only when this package, \`@fridgeboard/lambda-kit\` or \`@fridgeboard/contract\` changes.`,
      '',
      '| Command | What it does |',
      '|---|---|',
      '| `pnpm build` | Bundles `src/index.ts` to `dist/index.mjs` (override esbuild options in `build.config.ts`) |',
      '| `pnpm smoke` | Imports the built bundle |',
      '| `pnpm test` | Unit tests |',
      '',
      '`.deployment` holds the deployed function name; it must match the name in `local.functions` in `terraform-cloud-infra`.',
      '',
    ].join('\n'),
    'CHANGELOG.md': ['# Changelog', '', '## Unreleased', ''].join('\n'),
  };
};

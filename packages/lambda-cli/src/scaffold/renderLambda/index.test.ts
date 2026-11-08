import { renderLambda } from './index.ts';

describe('renderLambda', () => {
  const files = renderLambda({ name: 'listItems', kind: 'wrapped' });

  it('names the deployed function after the folder', () => {
    expect(files['.deployment']).toBe('fridgeboard-list-items\n');
  });

  it('writes a manifest with the package name, kind and exports', () => {
    expect(JSON.parse(files['package.json'] ?? '')).toMatchObject({
      name: '@fridgeboard/fn-list-items',
      lambda: { kind: 'wrapped' },
      exports: { '.': './src/index.ts', './*': './src/*' },
      scripts: { build: 'lambda-build', smoke: 'lambda-smoke', test: 'vitest run' },
    });
  });

  it('adds the given dependencies, sorted, to the manifest', () => {
    const manifest = JSON.parse(
      renderLambda({
        name: 'me',
        kind: 'wrapped',
        dependencies: { zod: '4.6.7', '@aws-sdk/client-s3': '3.1152.0' },
        devDependencies: { '@fridgeboard/lambda-kit': 'workspace:*' },
      })['package.json'] ?? '',
    );

    expect(Object.keys(manifest.dependencies)).toEqual(['@aws-sdk/client-s3', 'zod']);
    expect(manifest.devDependencies['@fridgeboard/lambda-kit']).toBe('workspace:*');
    expect(manifest.devDependencies['@fridgeboard/lambda-cli']).toBe('workspace:*');
  });

  it('writes every supporting file', () => {
    expect(Object.keys(files).toSorted()).toEqual([
      '.deployment',
      'CHANGELOG.md',
      'Makefile',
      'README.md',
      'build.config.ts',
      'package.json',
      'tsconfig.json',
      'vitest.config.ts',
    ]);
  });
});

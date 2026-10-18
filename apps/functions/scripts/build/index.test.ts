import { ESM_REQUIRE_BANNER, HANDLERS_DIR, OUT_DIR } from './constants.ts';

const mocks = vi.hoisted(() => ({ build: vi.fn(), readdirSync: vi.fn(), existsSync: vi.fn() }));

vi.mock('esbuild', () => ({ build: mocks.build }));
vi.mock('node:fs', () => ({ readdirSync: mocks.readdirSync, existsSync: mocks.existsSync }));

const entry = (name: string, isDirectory: boolean) => ({ name, isDirectory: () => isDirectory });

describe('build script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    mocks.build.mockResolvedValue(undefined);
    mocks.readdirSync.mockReturnValue([
      entry('auth', true),
      entry('me', true),
      entry('shared', true),
      entry('README.md', false),
    ]);
    mocks.existsSync.mockImplementation((path: string) => !path.includes('/shared/'));
  });

  it('bundles every handler directory that has an index.ts', async () => {
    await import('./index.ts');

    expect(mocks.build.mock.calls.map(([options]) => options.entryPoints)).toEqual([
      [`${HANDLERS_DIR}/auth/index.ts`],
      [`${HANDLERS_DIR}/me/index.ts`],
    ]);
  });

  it('emits a minified node24 ESM bundle with the require shim', async () => {
    await import('./index.ts');

    expect(mocks.build).toHaveBeenCalledWith({
      entryPoints: [`${HANDLERS_DIR}/auth/index.ts`],
      outfile: `${OUT_DIR}/auth/index.mjs`,
      bundle: true,
      platform: 'node',
      target: 'node24',
      format: 'esm',
      minify: true,
      sourcemap: false,
      banner: { js: ESM_REQUIRE_BANNER },
    });
  });

  it('fails when a bundle fails to build', async () => {
    mocks.build.mockRejectedValue(new Error('bad bundle'));

    await expect(import('./index.ts')).rejects.toThrow('bad bundle');
  });
});

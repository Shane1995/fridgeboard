import { ENTRY_FILE, ESM_REQUIRE_BANNER, OUT_FILE } from './constants.ts';

const mocks = vi.hoisted(() => ({ build: vi.fn(), loadBuildConfig: vi.fn() }));

vi.mock('esbuild', () => ({ build: mocks.build }));
vi.mock('./loadBuildConfig/index.ts', () => ({ loadBuildConfig: mocks.loadBuildConfig }));

describe('lambda-build', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    mocks.build.mockResolvedValue(undefined);
    mocks.loadBuildConfig.mockResolvedValue({});
  });

  it('emits a minified node24 ESM bundle with the require shim', async () => {
    await import('./index.ts');

    expect(mocks.build).toHaveBeenCalledWith({
      entryPoints: [ENTRY_FILE],
      outfile: OUT_FILE,
      bundle: true,
      platform: 'node',
      target: 'node24',
      format: 'esm',
      minify: true,
      sourcemap: false,
      banner: { js: ESM_REQUIRE_BANNER },
    });
  });

  it('applies the Lambda build config but never changes the entry or output', async () => {
    mocks.loadBuildConfig.mockResolvedValue({ minify: false, external: ['sharp'] });

    await import('./index.ts');

    expect(mocks.build).toHaveBeenCalledWith(
      expect.objectContaining({
        minify: false,
        external: ['sharp'],
        entryPoints: [ENTRY_FILE],
        outfile: OUT_FILE,
      }),
    );
  });

  it('fails when the bundle fails to build', async () => {
    mocks.build.mockRejectedValue(new Error('bad bundle'));

    await expect(import('./index.ts')).rejects.toThrow('bad bundle');
  });
});

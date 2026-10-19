import { REEXPORT_ERROR, ROOTS } from './constants.ts';

const mocks = vi.hoisted(() => ({ findReexports: vi.fn() }));

vi.mock('./findReexports/index.ts', () => ({ findReexports: mocks.findReexports }));

const runScript = async () => {
  vi.resetModules();
  await import('./index.ts');
};

describe('checkReexports script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('scans the configured roots', async () => {
    mocks.findReexports.mockReturnValue([]);

    await runScript();

    expect(mocks.findReexports).toHaveBeenCalledWith(ROOTS);
  });

  it('stays quiet and succeeds when there are no re-exports', async () => {
    mocks.findReexports.mockReturnValue([]);

    await runScript();

    expect(console.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('lists the offending files and fails', async () => {
    mocks.findReexports.mockReturnValue(['a/index.ts', 'b/index.ts']);

    await runScript();

    expect(console.error).toHaveBeenCalledWith(`${REEXPORT_ERROR}\na/index.ts\nb/index.ts`);
    expect(process.exitCode).toBe(1);
  });
});

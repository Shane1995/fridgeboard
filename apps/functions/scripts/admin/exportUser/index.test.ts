const mocks = vi.hoisted(() => ({ runExportUser: vi.fn() }));

vi.mock('../utils/runExportUser/index.ts', () => ({ runExportUser: mocks.runExportUser }));

const runScript = async (...args: string[]) => {
  process.argv = ['node', 'exportUser', ...args];
  vi.resetModules();
  await import('./index.ts');
};

describe('exportUser script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('exports into the working directory and prints the file path', async () => {
    mocks.runExportUser.mockResolvedValue('/work/export-u1.json');

    await runScript('jess@example.com');

    expect(mocks.runExportUser).toHaveBeenCalledWith('jess@example.com', process.cwd());
    expect(console.log).toHaveBeenCalledWith('/work/export-u1.json');
  });

  it('fails with a usage error when no email is given', async () => {
    await runScript();

    expect(mocks.runExportUser).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});

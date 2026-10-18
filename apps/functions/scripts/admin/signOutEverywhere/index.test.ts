const mocks = vi.hoisted(() => ({ runSignOutEverywhere: vi.fn() }));

vi.mock('../utils/runSignOutEverywhere/index.ts', () => ({
  runSignOutEverywhere: mocks.runSignOutEverywhere,
}));

const runScript = async (...args: string[]) => {
  process.argv = ['node', 'signOutEverywhere', ...args];
  vi.resetModules();
  await import('./index.ts');
};

describe('signOutEverywhere script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('signs the user out and confirms', async () => {
    mocks.runSignOutEverywhere.mockResolvedValue(undefined);

    await runScript('jess@example.com');

    expect(mocks.runSignOutEverywhere).toHaveBeenCalledWith('jess@example.com');
    expect(console.log).toHaveBeenCalledWith('Signed out jess@example.com everywhere.');
  });

  it('reports a failure and sets a failing exit code', async () => {
    mocks.runSignOutEverywhere.mockRejectedValue(new Error('boom'));

    await runScript('jess@example.com');

    expect(console.error).toHaveBeenCalledWith('Error: boom');
    expect(process.exitCode).toBe(1);
  });
});

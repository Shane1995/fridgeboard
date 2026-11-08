import { MISMATCH_MESSAGE } from './constants.ts';

const mocks = vi.hoisted(() => ({ runDeleteUser: vi.fn(), promptUser: vi.fn() }));

vi.mock('../utils/runDeleteUser/index.ts', () => ({ runDeleteUser: mocks.runDeleteUser }));
vi.mock('../utils/promptUser/index.ts', () => ({ promptUser: mocks.promptUser }));

const runScript = async (...args: string[]) => {
  process.argv = ['node', 'deleteUser', ...args];
  vi.resetModules();
  await import('./index.ts');
};

describe('deleteUser script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.runDeleteUser.mockResolvedValue({ households: 2 });
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('deletes without prompting when --yes is passed', async () => {
    await runScript('jess@example.com', '--yes');

    expect(mocks.promptUser).not.toHaveBeenCalled();
    expect(mocks.runDeleteUser).toHaveBeenCalledWith('jess@example.com');
    expect(console.log).toHaveBeenCalledWith(
      'Deleted jess@example.com (2 empty household(s) removed).',
    );
  });

  it('deletes when the re-typed email matches', async () => {
    mocks.promptUser.mockResolvedValue(' Jess@Example.com ');

    await runScript('jess@example.com');

    expect(mocks.runDeleteUser).toHaveBeenCalledWith('jess@example.com');
    expect(process.exitCode).toBeUndefined();
  });

  it('deletes nothing and fails when the re-typed email does not match', async () => {
    mocks.promptUser.mockResolvedValue('someone@else.com');

    await runScript('jess@example.com');

    expect(mocks.runDeleteUser).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(MISMATCH_MESSAGE);
    expect(process.exitCode).toBe(1);
  });

  it('reports a failure and sets a failing exit code', async () => {
    mocks.runDeleteUser.mockRejectedValue(new Error('boom'));

    await runScript('jess@example.com', '--yes');

    expect(console.error).toHaveBeenCalledWith('Error: boom');
    expect(process.exitCode).toBe(1);
  });
});

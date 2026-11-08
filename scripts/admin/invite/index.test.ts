import { NEXT_STEP_MESSAGE, VERIFY_MESSAGE } from './constants.ts';

const mocks = vi.hoisted(() => ({ runInvite: vi.fn() }));

vi.mock('../utils/runInvite/index.ts', () => ({ runInvite: mocks.runInvite }));

const runScript = async (...args: string[]) => {
  process.argv = ['node', 'invite', ...args];
  vi.resetModules();
  await import('./index.ts');
};

describe('invite script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(1_700_000_000_500));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.runInvite.mockResolvedValue({ link: 'https://join#email=a', identity: 'created' });
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('invites with the parsed flags and the current epoch seconds', async () => {
    await runScript('jess@example.com', '--app', '--admin');

    expect(mocks.runInvite).toHaveBeenCalledWith({
      email: 'jess@example.com',
      app: true,
      admin: true,
      household: undefined,
      now: 1_700_000_000,
    });
  });

  it('prints the identity, join link and next steps', async () => {
    await runScript('jess@example.com', '--household', 'hh1');

    expect(console.log).toHaveBeenCalledWith(
      'Invite written for jess@example.com (SES identity: created).',
    );
    expect(console.log).toHaveBeenCalledWith('Join link: https://join#email=a');
    expect(console.log).toHaveBeenCalledWith(NEXT_STEP_MESSAGE);
    expect(console.log).toHaveBeenCalledWith(VERIFY_MESSAGE);
  });

  it('rejects an invite with no target', async () => {
    await runScript('jess@example.com');

    expect(mocks.runInvite).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});

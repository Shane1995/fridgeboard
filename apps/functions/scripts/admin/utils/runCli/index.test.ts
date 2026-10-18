import { runCli } from './index.ts';

describe('runCli', () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('prints the error message without a stack and sets a failing exit code', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await runCli(async () => {
      throw new Error('boom');
    });

    expect(error).toHaveBeenCalledWith('Error: boom');
    expect(process.exitCode).toBe(1);
  });

  it('leaves the exit code alone on success', async () => {
    await runCli(async () => {});

    expect(process.exitCode).toBeUndefined();
  });
});

import { DEPLOYMENT_ERROR, LAMBDAS_ROOT } from './constants.ts';

const mocks = vi.hoisted(() => ({ findDeploymentErrors: vi.fn() }));

vi.mock('./findDeploymentErrors/index.ts', () => ({
  findDeploymentErrors: mocks.findDeploymentErrors,
}));

const runScript = async () => {
  vi.resetModules();
  await import('./index.ts');
};

describe('checkDeployments script', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('checks the Lambdas folder', async () => {
    mocks.findDeploymentErrors.mockReturnValue([]);

    await runScript();

    expect(mocks.findDeploymentErrors).toHaveBeenCalledWith(LAMBDAS_ROOT);
  });

  it('stays quiet and succeeds when every deployment is valid', async () => {
    mocks.findDeploymentErrors.mockReturnValue([]);

    await runScript();

    expect(console.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('prints every problem and fails', async () => {
    mocks.findDeploymentErrors.mockReturnValue(['a: bad', 'b: worse']);

    await runScript();

    expect(console.error).toHaveBeenCalledWith(`${DEPLOYMENT_ERROR}\na: bad\nb: worse`);
    expect(process.exitCode).toBe(1);
  });
});

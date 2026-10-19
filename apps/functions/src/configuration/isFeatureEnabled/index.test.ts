import { getConfiguration } from '../index.ts';
import { isFeatureEnabled } from './index.ts';

vi.mock('../index.ts', () => ({ getConfiguration: vi.fn() }));

const FLAG = 'SOME_FLAG' as never;

describe('isFeatureEnabled', () => {
  it('reads the flag from the loaded configuration', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      version: 1,
      featureFlags: { SOME_FLAG: true },
      services: {},
    } as never);

    await expect(isFeatureEnabled(FLAG)).resolves.toBe(true);
  });

  it('is false for a flag the configuration does not carry', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      version: 1,
      featureFlags: {},
      services: {},
    } as never);

    await expect(isFeatureEnabled(FLAG)).resolves.toBe(false);
  });
});

import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { queryClient } from '../../queryClient';
import { CONFIGURATION_QUERY_KEY } from '../constants';
import { setConfiguration } from '../setConfiguration';
import { prefetchConfiguration } from './index';

afterEach(() => {
  vi.restoreAllMocks();
  queryClient.clear();
  setConfiguration(DEFAULT_WEB_CONFIGURATION);
});

describe('prefetchConfiguration', () => {
  it('starts the fetch without waiting and caches the result under the configuration key', async () => {
    const served = {
      version: 1,
      featureFlags: {},
      services: {},
      settings: { refreshLeadMs: 9_000 },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(served)));

    expect(prefetchConfiguration()).toBeUndefined();

    await vi.waitFor(() =>
      expect(queryClient.getQueryData(CONFIGURATION_QUERY_KEY)).toMatchObject({
        settings: { refreshLeadMs: 9_000 },
      }),
    );
  });

  it('never throws when the fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    prefetchConfiguration();

    await vi.waitFor(() =>
      expect(queryClient.getQueryData(CONFIGURATION_QUERY_KEY)).toEqual(DEFAULT_WEB_CONFIGURATION),
    );
  });
});

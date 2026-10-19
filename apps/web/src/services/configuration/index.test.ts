import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { getConfiguration } from './index';

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getConfiguration', () => {
  it('fetches /configuration.json', async () => {
    const spy = respond(DEFAULT_WEB_CONFIGURATION);

    await getConfiguration();

    expect(spy).toHaveBeenCalledWith('/configuration.json');
  });

  it('merges served flags over the defaults', async () => {
    respond({ version: 1, featureFlags: { ENABLE_ADMIN_INVITES: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual({
      version: 1,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
      services: {},
    });
  });

  it('fills missing flags from the defaults', async () => {
    respond({ version: 1, featureFlags: {}, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores flag names the app does not know', async () => {
    respond({ version: 1, featureFlags: { REMOVED_FLAG: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults on a non-ok response', async () => {
    respond({}, 500);

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults on an invalid document', async () => {
    respond({ version: 2 });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('falls back to defaults when the request throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });
});

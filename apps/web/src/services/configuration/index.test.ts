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

    expect(spy).toHaveBeenCalledWith('/configuration.json', {
      signal: expect.any(AbortSignal),
    });
  });

  it('merges served flags over the defaults', async () => {
    respond({
      version: 1,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
      services: {},
    });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      featureFlags: { ENABLE_ADMIN_INVITES: true, ENABLE_PASSKEYS: false },
    });
  });

  it('fills missing flags from the defaults', async () => {
    respond({ version: 1, featureFlags: {}, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('merges served services over the defaults', async () => {
    const me = { url: '/api/{version}/profile', params: { version: 'v2' } };
    respond({ version: 1, featureFlags: {}, services: { me } });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      services: { ...DEFAULT_WEB_CONFIGURATION.services, me },
    });
  });

  it('ignores a legacy top-level params key', async () => {
    respond({
      version: 1,
      featureFlags: {},
      params: { version: 'v2' },
      services: {},
    });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores service names the app does not know', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: { removed: { url: '/api/x' } },
    });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('rejects a service url outside /api/', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: { me: { url: '/other' } },
    });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores flag names the app does not know', async () => {
    respond({ version: 1, featureFlags: { REMOVED_FLAG: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('merges served settings over the defaults', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: {},
      settings: { refreshLeadMs: 10_000 },
    });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      settings: { ...DEFAULT_WEB_CONFIGURATION.settings, refreshLeadMs: 10_000 },
    });
  });

  it('returns served query and mutation entries', async () => {
    const queries = { default: { retry: 2 }, me: { staleTimeMs: 5_000 } };
    const mutations = { signOut: { retry: 0 } };
    respond({ version: 1, featureFlags: {}, services: {}, queries, mutations });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      queries,
      mutations,
    });
  });

  it('ignores setting, query and mutation names the app does not know', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: {},
      settings: { removed: 1 },
      queries: { removed: { retry: 1 } },
      mutations: { removed: { retry: 1 } },
    });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores unknown keys inside query and mutation entries', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: {},
      queries: { me: { retry: 1, removed: true } },
      mutations: { signOut: { retry: 1, removed: true } },
    });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      queries: { me: { retry: 1 } },
      mutations: { signOut: { retry: 1 } },
    });
  });

  it('rejects a configurable mutation name for sign-in mutations', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: {},
      mutations: { verifyCode: { retry: 1 } },
    });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('rejects a setting outside its bounds', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: {},
      settings: { refreshLeadMs: 1 },
    });

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

import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import { setConfiguration } from './setConfiguration';
import { WEB_SETTING } from '@fridgeboard/contract/configuration/settings/constants';
import { getSetting } from './getSetting';
import { getConfiguration, getServicePath } from './index';

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
  setConfiguration(DEFAULT_WEB_CONFIGURATION);
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
    respond({ version: 1, featureFlags: { ENABLE_ADMIN_INVITES: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      featureFlags: { ENABLE_ADMIN_INVITES: true },
    });
  });

  it('fills missing flags from the defaults', async () => {
    respond({ version: 1, featureFlags: {}, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('merges served params and services over the defaults', async () => {
    respond({
      version: 1,
      featureFlags: {},
      params: { version: 'v2' },
      services: { me: { url: '/api/{version}/profile' } },
    });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      params: { version: 'v2' },
      services: { ...DEFAULT_WEB_CONFIGURATION.services, me: { url: '/api/{version}/profile' } },
    });
  });

  it('ignores service names the app does not know', async () => {
    respond({ version: 1, featureFlags: {}, services: { removed: { url: '/api/x' } } });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('rejects a service url outside /api/', async () => {
    respond({ version: 1, featureFlags: {}, services: { me: { url: '/other' } } });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('ignores flag names the app does not know', async () => {
    respond({ version: 1, featureFlags: { REMOVED_FLAG: true }, services: {} });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('merges served settings over the defaults', async () => {
    respond({ version: 1, featureFlags: {}, services: {}, settings: { refreshLeadMs: 10_000 } });

    await expect(getConfiguration()).resolves.toEqual({
      ...DEFAULT_WEB_CONFIGURATION,
      settings: { refreshLeadMs: 10_000, refreshMinIntervalMs: 60_000 },
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

  it('rejects a setting outside its bounds', async () => {
    respond({ version: 1, featureFlags: {}, services: {}, settings: { refreshLeadMs: 1 } });

    await expect(getConfiguration()).resolves.toEqual(DEFAULT_WEB_CONFIGURATION);
  });

  it('stores the loaded configuration for getSetting', async () => {
    respond({ version: 1, featureFlags: {}, services: {}, settings: { refreshLeadMs: 10_000 } });

    await getConfiguration();

    expect(getSetting(WEB_SETTING.refreshLeadMs)).toBe(10_000);
  });

  it('leaves the store untouched when the fetch fails', async () => {
    respond({ version: 1, featureFlags: {}, services: {}, settings: { refreshLeadMs: 10_000 } });
    await getConfiguration();
    respond({}, 500);

    await getConfiguration();

    expect(getSetting(WEB_SETTING.refreshLeadMs)).toBe(10_000);
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

describe('getServicePath', () => {
  it('resolves the default path before any configuration has loaded', () => {
    expect(getServicePath(WebService.signOut)).toBe('/api/v1/auth/sign-out');
  });

  it('does not touch the network', () => {
    const spy = respond(DEFAULT_WEB_CONFIGURATION);

    getServicePath(WebService.me);

    expect(spy).not.toHaveBeenCalled();
  });

  it('follows a served version bump once the configuration has loaded', async () => {
    respond({ version: 1, featureFlags: {}, params: { version: 'v2' }, services: {} });

    await getConfiguration();

    expect(getServicePath(WebService.me)).toBe('/api/v2/me');
  });

  it('keeps the defaults when the fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await getConfiguration();

    expect(getServicePath(WebService.verify)).toBe('/api/v1/auth/verify');
  });

  it('keeps the last loaded configuration when a later fetch fails', async () => {
    respond({ version: 1, featureFlags: {}, params: { version: 'v2' }, services: {} });
    await getConfiguration();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await getConfiguration();

    expect(getServicePath(WebService.me)).toBe('/api/v2/me');
  });

  it('falls back to the default path when a loaded url has an unresolved placeholder', async () => {
    respond({
      version: 1,
      featureFlags: {},
      services: { refresh: { url: '/api/{missing}/auth/refresh' } },
    });

    await getConfiguration();

    expect(getServicePath(WebService.refresh)).toBe('/api/v1/auth/refresh');
  });
});
